import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import ViewTransactions from './pages/ViewTransactions';
import Users from './pages/Users';
import Codes from './pages/Codes';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Ledger from './pages/Ledger';
import LedgerDetail from './pages/LedgerDetail';
import TrialBalance from './pages/TrialBalance';
import ProfitAndLoss from './pages/ProfitAndLoss';
import BalanceSheet from './pages/BalanceSheet';
import BackupRestore from './pages/BackupRestore';
import ScheduleWork from './pages/ScheduleWork';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions/all" 
            element={
              <ProtectedRoute>
                <ViewTransactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions/edit/:id" 
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions/reverse/:id" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/codes" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Codes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/ledger" 
            element={
              <ProtectedRoute>
                <Ledger />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/ledger/:code" 
            element={
              <ProtectedRoute>
                <LedgerDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/trial-balance" 
            element={
              <ProtectedRoute>
                <TrialBalance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/profit-and-loss" 
            element={
              <ProtectedRoute>
                <ProfitAndLoss />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/balance-sheet" 
            element={
              <ProtectedRoute>
                <BalanceSheet />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/backup-restore" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <BackupRestore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/schedule-work/work-to-be-done" 
            element={
              <ProtectedRoute>
                <ScheduleWork />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
