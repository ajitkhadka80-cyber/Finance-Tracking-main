const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'finora_super_secret_key_123'; // In prod, this should be in .env

// === AUTHENTICATION MIDDLEWARE ===
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

// === LOGIN ENDPOINT ===
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // Update last_logged_in
    const now = new Date().toISOString();
    db.run("UPDATE users SET last_logged_in = ? WHERE id = ?", [now, user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const { password: _, ...userInfo } = user;
    userInfo.last_logged_in = now;
    res.json({ token, user: userInfo });
  });
});

// === CODES ===
app.get('/api/codes', authenticateToken, (req, res) => {
  db.all("SELECT * FROM codes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/codes/:number', authenticateToken, (req, res) => {
  db.get("SELECT * FROM codes WHERE code_number = ?", [req.params.number], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Code not found' });
    res.json(row);
  });
});

app.post('/api/codes', authenticateToken, requireAdmin, (req, res) => {
  const { code_number, description, classification } = req.body;
  if (!code_number || !description || !classification) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(`INSERT INTO codes (code_number, description, classification) VALUES (?, ?, ?)`,
    [code_number, description, classification],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, code_number, description, classification });
    });
});

app.post('/api/codes/bulk', authenticateToken, requireAdmin, (req, res) => {
  const { codes } = req.body;
  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: 'No codes provided' });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    const stmt = db.prepare(`INSERT INTO codes (code_number, description, classification) VALUES (?, ?, ?) ON CONFLICT(code_number) DO UPDATE SET description = excluded.description, classification = excluded.classification`);

    let hasError = false;
    for (const code of codes) {
      if (!code.code_number || !code.description || !code.classification) continue;
      stmt.run(code.code_number, code.description, code.classification, (err) => {
        if (err) hasError = true;
      });
    }
    stmt.finalize();

    db.run(hasError ? "ROLLBACK" : "COMMIT", (err) => {
      if (err || hasError) return res.status(500).json({ error: "Failed to upload codes" });
      res.json({ success: true, message: 'Codes uploaded successfully' });
    });
  });
});

app.put('/api/codes/:number', authenticateToken, requireAdmin, (req, res) => {
  const { number } = req.params;
  const { code_number, description, classification } = req.body;
  if (!code_number || !description || !classification) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(`UPDATE codes SET code_number = ?, description = ?, classification = ? WHERE code_number = ?`,
    [code_number, description, classification, number],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, code_number, description, classification });
    });
});

app.delete('/api/codes/:number', authenticateToken, requireAdmin, (req, res) => {
  const { number } = req.params;
  db.run(`DELETE FROM codes WHERE code_number = ?`, [number], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Code deleted' });
  });
});

// === USERS ===
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  db.all("SELECT id, name, email, role, last_logged_in FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  db.run(`INSERT INTO users (name, email, password, role, last_logged_in) VALUES (?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, role, 'Never'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, email, role, last_logged_in: 'Never' });
    });
});

// === PASSWORD MANAGEMENT ===
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      // Don't leak whether email exists
      return res.json({ success: true, message: 'If the email exists, a reset request was sent to the admin.' });
    }

    db.run("INSERT INTO password_reset_requests (email) VALUES (?)", [email], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Password reset request sent to admin.' });
    });
  });
});

app.get('/api/password-reset-requests', authenticateToken, requireAdmin, (req, res) => {
  db.all("SELECT * FROM password_reset_requests WHERE status = 'pending' ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  const { newPassword, requestId } = req.body;
  const { id } = req.params;

  if (!newPassword) return res.status(400).json({ error: 'New password required' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    if (requestId) {
      db.run("UPDATE password_reset_requests SET status = 'resolved' WHERE id = ?", [requestId]);
    }
    res.json({ success: true, message: 'Password successfully reset by admin.' });
  });
});

app.put('/api/users/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing passwords' });

  db.get("SELECT * FROM users WHERE id = ?", [req.user.id], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Password updated successfully' });
    });
  });
});

// === FISCAL YEARS ===
app.get('/api/fiscal-years', authenticateToken, (req, res) => {
  db.all("SELECT * FROM fiscal_years ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/fiscal-years', authenticateToken, requireAdmin, (req, res) => {
  const { name, start_date, end_date } = req.body;
  if (!name || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(`INSERT INTO fiscal_years (name, start_date, end_date, is_current) VALUES (?, ?, ?, ?)`,
    [name, start_date, end_date, 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, start_date, end_date, is_current: 0 });
    });
});

app.put('/api/fiscal-years/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, start_date, end_date } = req.body;
  if (!name || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(`UPDATE fiscal_years SET name = ?, start_date = ?, end_date = ? WHERE id = ?`,
    [name, start_date, end_date, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Fiscal year not found' });
      res.json({ id, name, start_date, end_date });
    });
});

app.put('/api/fiscal-years/:id/set-current', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run("UPDATE fiscal_years SET is_current = 0", (err) => {
      if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: err.message }); }
    });
    db.run("UPDATE fiscal_years SET is_current = 1 WHERE id = ?", [id], (err) => {
      if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: err.message }); }
    });
    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Fiscal year updated' });
    });
  });
});

// === SETTINGS ===
app.get('/api/settings', (req, res) => {
  // Publicly readable so app can load org_name easily
  db.all("SELECT * FROM settings", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settings = rows.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settings);
  });
});

app.put('/api/settings', authenticateToken, requireAdmin, (req, res) => {
  const { org_name, org_address, currency, receipt_language } = req.body;

  const updates = [];
  if (org_name !== undefined) updates.push(['org_name', org_name]);
  if (org_address !== undefined) updates.push(['org_address', org_address]);
  if (currency !== undefined) updates.push(['currency', currency]);
  if (receipt_language !== undefined) updates.push(['receipt_language', receipt_language]);

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields provided' });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    let hasError = false;

    const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");

    for (const [key, val] of updates) {
      stmt.run(key, val, (err) => {
        if (err) hasError = true;
      });
    }
    stmt.finalize();

    db.run(hasError ? "ROLLBACK" : "COMMIT", (err) => {
      if (err || hasError) return res.status(500).json({ error: "Failed to save settings" });
      res.json({ success: true });
    });
  });
});

// === PUBLIC STATS ===
app.get('/api/public/stats', (req, res) => {
  // Returns aggregated, anonymous stats for the login page charts
  db.all("SELECT * FROM transactions", [], (err, txs) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT * FROM transaction_lines", [], (err, lines) => {
      if (err) return res.status(500).json({ error: err.message });

      // Group by YYYY-MM
      const monthlyStats = {};

      txs.forEach(tx => {
        if (!tx.date) return;
        const month = tx.date.substring(0, 7); // e.g. "2026-09"
        if (!monthlyStats[month]) {
          monthlyStats[month] = { netWorth: 0, income: 0, expense: 0 };
        }

        const txLines = lines.filter(l => l.transaction_id === tx.id);
        const dr = txLines.filter(l => l.type === 'Dr').reduce((s, l) => s + l.amount, 0);
        const cr = txLines.filter(l => l.type === 'Cr').reduce((s, l) => s + l.amount, 0);

        // Simplified heuristic: Cr is income/liability, Dr is expense/asset
        // We'll just map Dr to Expense and Cr to Income for the visual chart
        monthlyStats[month].expense += dr;
        monthlyStats[month].income += cr;
        monthlyStats[month].netWorth += (cr - dr); // Just a rough aggregate
      });

      // Convert to array and sort chronologically
      const sortedMonths = Object.keys(monthlyStats).sort();
      const chartData = sortedMonths.map(m => ({
        month: m,
        ...monthlyStats[m]
      }));

      // Calculate totals
      let totalNetWorth = 0;
      chartData.forEach(d => totalNetWorth += d.netWorth);

      res.json({
        chartData: chartData.slice(-6), // last 6 months
        totalNetWorth
      });
    });
  });
});
// === REPORTS ===
app.get('/api/reports/trial-balance', authenticateToken, (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'date is required' });
  }

  // Get fiscal year details
  db.get("SELECT * FROM fiscal_years WHERE start_date <= ? AND end_date >= ?", [date, date], (err, fy) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!fy) return res.status(404).json({ error: 'No fiscal year covers the selected date' });

    const startDate = fy.start_date; // e.g. "2077-03-01"
    const cutoffDate = date;

    // Fetch all codes
    db.all("SELECT * FROM codes ORDER BY code_number ASC", [], (err, codes) => {
      if (err) return res.status(500).json({ error: err.message });

      // Fetch all transactions up to cutoff date
      const txQuery = `
        SELECT t.date, tl.code_number, tl.type, tl.amount 
        FROM transaction_lines tl
        JOIN transactions t ON tl.transaction_id = t.id
        WHERE t.date <= ?
      `;

      db.all(txQuery, [cutoffDate], (err, lines) => {
        if (err) return res.status(500).json({ error: err.message });

        const trialBalance = [];
        let totalDr = 0;
        let totalCr = 0;

        for (const code of codes) {
          let dr = 0;
          let cr = 0;

          const isIncomeOrExpenditure = code.classification.toLowerCase().includes('income') || code.classification.toLowerCase().includes('expenditure');

          // Filter lines for this code
          const codeLines = lines.filter(l => l.code_number === code.code_number);

          for (const line of codeLines) {
            if (isIncomeOrExpenditure) {
              // Only consider lines within the selected fiscal year
              if (line.date >= startDate && line.date <= cutoffDate) {
                if (line.type === 'Dr') dr += line.amount;
                if (line.type === 'Cr') cr += line.amount;
              }
            } else {
              // Assets and Liabilities take cumulative from start of time up to cutoff
              if (line.type === 'Dr') dr += line.amount;
              if (line.type === 'Cr') cr += line.amount;
            }
          }

          let balance = 0;
          let displayDr = 0;
          let displayCr = 0;

          const classification = code.classification.toLowerCase();

          if (classification.includes('asset') || classification.includes('expenditure')) {
            balance = dr - cr;
            if (balance > 0) displayDr = balance;
            else if (balance < 0) displayCr = Math.abs(balance);
          } else {
            balance = cr - dr;
            if (balance > 0) displayCr = balance;
            else if (balance < 0) displayDr = Math.abs(balance);
          }

          if (balance !== 0) {
            trialBalance.push({
              code: code.code_number,
              description: code.description,
              classification: code.classification,
              debit: displayDr,
              credit: displayCr
            });
            totalDr += displayDr;
            totalCr += displayCr;
          }
        }

        res.json({
          data: trialBalance,
          totalDebit: totalDr,
          totalCredit: totalCr,
          fiscalYear: fy
        });
      });
    });
  });
});

// === TRANSACTIONS ===
app.get('/api/transactions', authenticateToken, (req, res) => {
  // Fetch transactions and their lines
  db.all("SELECT * FROM transactions ORDER BY id DESC", [], (err, txs) => {
    if (err) return res.status(500).json({ error: err.message });

    if (txs.length === 0) return res.json([]);

    db.all("SELECT * FROM transaction_lines", [], (err, lines) => {
      if (err) return res.status(500).json({ error: err.message });

      const txsWithLines = txs.map(tx => {
        const txLines = lines.filter(l => l.transaction_id === tx.id);
        const totalDr = txLines.filter(l => l.type === 'Dr').reduce((sum, l) => sum + l.amount, 0);
        const totalCr = txLines.filter(l => l.type === 'Cr').reduce((sum, l) => sum + l.amount, 0);

        return {
          ...tx,
          lines: txLines,
          totalDr,
          totalCr
        };
      });
      res.json(txsWithLines);
    });
  });
});

app.get('/api/ledger/:code', authenticateToken, (req, res) => {
  const codeNumber = req.params.code;

  db.get("SELECT * FROM codes WHERE code_number = ?", [codeNumber], (err, codeRow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!codeRow) return res.status(404).json({ error: 'Code not found' });

    const query = `
      SELECT t.date, t.sn, t.final_description, tl.type, tl.amount 
      FROM transaction_lines tl
      JOIN transactions t ON tl.transaction_id = t.id
      WHERE tl.code_number = ?
      ORDER BY t.date ASC, t.id ASC
    `;

    db.all(query, [codeNumber], (err, lines) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        code: codeRow,
        transactions: lines
      });
    });
  });
});

app.post('/api/transactions', authenticateToken, (req, res) => {
  const { sn, date, final_description, lines } = req.body;
  if (!sn || !date || !lines || lines.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or lines' });
  }

  const txDateStr = date.split(' ')[0];
  db.get("SELECT start_date, end_date FROM fiscal_years WHERE is_current = 1", [], (err, activeFy) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!activeFy) return res.status(400).json({ error: 'No active fiscal year found' });

    if (txDateStr < activeFy.start_date || txDateStr > activeFy.end_date) {
      return res.status(400).json({ error: 'Transactions can only be posted in the active fiscal year' });
    }

    let duplicateQuery = "SELECT id FROM transactions WHERE sn = ? AND substr(date, 1, 10) >= ? AND substr(date, 1, 10) <= ?";
    let duplicateParams = [sn, activeFy.start_date, activeFy.end_date];

    db.get(duplicateQuery, duplicateParams, (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'Duplicate voucher Number' });

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const modified_at = new Date().toISOString();
        db.run(`INSERT INTO transactions (sn, date, final_description, created_by, modified_by, modified_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [sn, date, final_description, req.user.name, req.user.name, modified_at],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }

            const txId = this.lastID;
            const stmt = db.prepare("INSERT INTO transaction_lines (transaction_id, code_number, type, amount) VALUES (?, ?, ?, ?)");

            for (const line of lines) {
              stmt.run(txId, line.code_number, line.type, line.amount, (err) => {
                if (err) console.error("Error inserting line:", err);
              });
            }
            stmt.finalize();

            db.run("COMMIT", (err) => {
              if (err) return res.status(500).json({ error: "Commit failed" });
              res.json({ success: true, transaction_id: txId });
            });
          }
        );
      });
    });
  });
});

app.post('/api/transactions/bulk', authenticateToken, (req, res) => {
  const { transactions } = req.body;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: 'No transactions provided' });
  }

  db.get("SELECT start_date, end_date FROM fiscal_years WHERE is_current = 1", [], (err, activeFy) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!activeFy) return res.status(400).json({ error: 'No active fiscal year found' });

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      let hasError = false;
      let errorMessage = '';

      const checkDuplicateStmt = db.prepare("SELECT id FROM transactions WHERE sn = ? AND substr(date, 1, 10) >= ? AND substr(date, 1, 10) <= ?");
      const insertTxStmt = db.prepare(`INSERT INTO transactions (sn, date, final_description, created_by, modified_by, modified_at) VALUES (?, ?, ?, ?, ?, ?)`);
      const insertLineStmt = db.prepare("INSERT INTO transaction_lines (transaction_id, code_number, type, amount) VALUES (?, ?, ?, ?)");

      const modified_at = new Date().toISOString();

      const processTransactions = async () => {
        try {
          for (const tx of transactions) {
            const txDateStr = tx.date.split(' ')[0];
            if (txDateStr < activeFy.start_date || txDateStr > activeFy.end_date) {
              throw new Error(`Transaction ${tx.sn} date is out of active fiscal year.`);
            }

            const row = await new Promise((resolve, reject) => {
              checkDuplicateStmt.get([tx.sn, activeFy.start_date, activeFy.end_date], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });

            if (row) {
              throw new Error(`Duplicate voucher Number: ${tx.sn}`);
            }

            const txId = await new Promise((resolve, reject) => {
              insertTxStmt.run([tx.sn, tx.date, tx.final_description || '', req.user.name, req.user.name, modified_at], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
              });
            });

            for (const line of tx.lines) {
              await new Promise((resolve, reject) => {
                insertLineStmt.run([txId, line.code_number, line.type, line.amount], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
            }
          }
        } catch (e) {
          hasError = true;
          errorMessage = e.message;
        }
      };

      processTransactions().then(() => {
        checkDuplicateStmt.finalize();
        insertTxStmt.finalize();
        insertLineStmt.finalize();

        if (hasError) {
          db.run("ROLLBACK");
          return res.status(400).json({ error: errorMessage });
        } else {
          db.run("COMMIT", (err) => {
            if (err) return res.status(500).json({ error: "Commit failed" });
            res.json({ success: true, message: `Successfully posted ${transactions.length} vouchers.` });
          });
        }
      });
    });
  });
});

app.get('/api/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM transactions WHERE id = ?", [id], (err, tx) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    db.all("SELECT * FROM transaction_lines WHERE transaction_id = ?", [id], (err, lines) => {
      if (err) return res.status(500).json({ error: err.message });

      const totalDr = lines.filter(l => l.type === 'Dr').reduce((sum, l) => sum + l.amount, 0);
      const totalCr = lines.filter(l => l.type === 'Cr').reduce((sum, l) => sum + l.amount, 0);

      res.json({
        ...tx,
        lines,
        totalDr,
        totalCr
      });
    });
  });
});

app.put('/api/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { sn, date, final_description, lines } = req.body;
  if (!sn || !date || !lines || lines.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or lines' });
  }

  const txDateStr = date.split(' ')[0];
  db.get("SELECT start_date, end_date FROM fiscal_years WHERE is_current = 1", [], (err, activeFy) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!activeFy) return res.status(400).json({ error: 'No active fiscal year found' });

    if (txDateStr < activeFy.start_date || txDateStr > activeFy.end_date) {
      return res.status(400).json({ error: 'Transactions can only be posted in the active fiscal year' });
    }

    let duplicateQuery = "SELECT id FROM transactions WHERE sn = ? AND id != ? AND substr(date, 1, 10) >= ? AND substr(date, 1, 10) <= ?";
    let duplicateParams = [sn, id, activeFy.start_date, activeFy.end_date];

    db.get(duplicateQuery, duplicateParams, (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'Duplicate voucher Number' });

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const modified_at = new Date().toISOString();
        db.run(`UPDATE transactions SET sn = ?, date = ?, final_description = ?, modified_by = ?, modified_at = ? WHERE id = ?`,
          [sn, date, final_description, req.user.name, modified_at, id],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }

            db.run("DELETE FROM transaction_lines WHERE transaction_id = ?", [id], function (err) {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }

              const stmt = db.prepare("INSERT INTO transaction_lines (transaction_id, code_number, type, amount) VALUES (?, ?, ?, ?)");
              for (const line of lines) {
                stmt.run(id, line.code_number, line.type, line.amount, (err) => {
                  if (err) console.error("Error inserting line:", err);
                });
              }
              stmt.finalize();

              db.run("COMMIT", (err) => {
                if (err) return res.status(500).json({ error: "Commit failed" });
                res.json({ success: true, transaction_id: id });
              });
            });
          }
        );
      });
    });
  });
});

app.delete('/api/transactions/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run("DELETE FROM transaction_lines WHERE transaction_id = ?", [id], function (err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }

      db.run("DELETE FROM transactions WHERE id = ?", [id], function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }

        db.run("COMMIT", (err) => {
          if (err) return res.status(500).json({ error: "Commit failed" });
          res.json({ success: true, message: 'Transaction deleted successfully' });
        });
      });
    });
  });
});

db.run("ALTER TABLE transactions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP", (err) => {
  if (!err) console.log("Added created_at to transactions table.");
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
