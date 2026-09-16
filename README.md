
# Finance Tracking System

A full-stack finance tracking application for managing transactions, fiscal years, users, access codes, and account settings.

## Architecture

```text
finance tracking/
├── frontend/    # # Finance Tracking System

A full-stack finance tracking application built with a **React/Vite frontend** and a **Node.js backend**. The system provides authentication, protected routes, financial dashboards, transaction management, fiscal-year management, users, access codes, administration, and account settings.

## System Architecture

```text
finance-tracking/
├── frontend/       # React/Vite client application
├── backend/        # Node.js API and database layer
└── README.md       # Project documentation
```

## Frontend

The frontend provides the user interface and client-side application logic.

### Technologies

* React
* Vite
* JavaScript
* CSS
* Client-side routing
* React Context API
* Authentication context

### Main Structure

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── App.css
    ├── index.css
    ├── assets/
    ├── components/
    ├── context/
    └── pages/
```

## Frontend Components

### Authentication

```text
src/components/auth/
├── LoginForm.jsx
└── LoginHero.jsx
```

Provides the login interface and supporting authentication content.

### Route Protection

```text
src/components/ProtectedRoute.jsx
```

Controls access to pages that require an authenticated user.

### Authentication Context

```text
src/context/AuthContext.jsx
```

Manages authentication state and makes user information available throughout the application.

### Dashboard

```text
src/components/dashboard/
├── DashboardCharts.jsx
├── DashboardFooter.jsx
├── DashboardHeader.jsx
├── DashboardMetricCards.jsx
└── DashboardTransactions.jsx
```

The dashboard provides an overview of financial information, including metrics, charts, and recent transactions.

### Administration

```text
src/components/admin/
├── AdminAddCodeForm.jsx
├── AdminAddUserForm.jsx
├── AdminCodesTab.jsx
├── AdminHeader.jsx
└── AdminUsersTab.jsx
```

Provides administrative functionality for managing users and access codes.

## Frontend Pages

```text
src/pages/
├── Admin.jsx
├── ChangePassword.jsx
├── Codes.jsx
├── Dashboard.jsx
├── FiscalYears.jsx
├── Login.jsx
├── Settings.jsx
├── Transactions.jsx
└── Users.jsx
```

| Page                 | Purpose                          |
| -------------------- | -------------------------------- |
| `Login.jsx`          | User authentication              |
| `Dashboard.jsx`      | Financial overview and summaries |
| `Transactions.jsx`   | Transaction management           |
| `FiscalYears.jsx`    | Fiscal-year management           |
| `Users.jsx`          | User management                  |
| `Codes.jsx`          | Access-code management           |
| `Settings.jsx`       | User and application settings    |
| `ChangePassword.jsx` | Password updates                 |
| `Admin.jsx`          | Administrative functionality     |

## Backend

The backend provides the server-side application, API functionality, and database operations.

```text
backend/
├── index.js
├── db.js
├── clear_db.js
└── package.json
```

### Backend Files

| File           | Responsibility                                             |
| -------------- | ---------------------------------------------------------- |
| `index.js`     | Starts the backend server and defines server functionality |
| `db.js`        | Provides database configuration and database access        |
| `clear_db.js`  | Utility for clearing or resetting database data            |
| `package.json` | Defines backend dependencies and scripts                   |

## Application Flow

1. The user opens the frontend application.
2. The login page authenticates the user through the backend.
3. Authentication state is maintained using `AuthContext`.
4. `ProtectedRoute` restricts access to authenticated pages.
5. The dashboard displays financial information.
6. Users manage transactions, fiscal years, and settings.
7. Administrators manage users and access codes.
8. The backend stores and retrieves application data from the database.

## Installation

### Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
npm start
```

Use the script names defined in `backend/package.json` if they differ.

### Frontend

Open another terminal in the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Use the script names defined in `frontend/package.json` if they differ.

## Database

Database configuration and access are handled through `db.js`.

The `clear_db.js` script is available for development database cleanup or reset operations.

> **Warning:** Run database cleanup or reset scripts only when data removal is intentionally required.

## Development

Run the backend and frontend in separate terminals:

```text
Terminal 1 → Backend server
Terminal 2 → Frontend development server
```

The frontend communicates with the backend through the API configuration defined within the application source and Vite configuration.

## Security Considerations

* Authentication is required for protected pages.
* Administrative functionality should only be accessible to authorized users.
* Passwords should never be stored in plain text.
* Database credentials should be stored using environment variables.
* Sensitive configuration values should not be committed to the repository.
* Database reset scripts should not be used in production without appropriate safeguards.
* API endpoints should validate and authorize incoming requests.

## Project Status

The project is organized as a full-stack finance tracking system with separate frontend and backend applications.

The system currently provides the core structure for:

* User authentication
* Protected application routes
* Financial dashboards
* Transaction management
* Fiscal-year management
* User management
* Access-code management
* Administration
* Account settings
* Password management
* Database operations

## License

No license has been specified for this project.
React/Vite client application
├── backend/     # Node.js server and database layer
└── README.md
```

## Technologies

- React
- Vite
- JavaScript
- CSS
- Node.js
- REST API
- Database integration

## Frontend

The frontend provides the user interface and communicates with the backend API.

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── App.css
    ├── index.css
    ├── assets/
    ├── components/
    ├── context/
    └── pages/
```

### Authentication

- `Login.jsx` provides the login page.
- `LoginForm.jsx` handles login input and submission.
- `LoginHero.jsx` provides login-page presentation.
- `AuthContext.jsx` manages authentication state.
- `ProtectedRoute.jsx` restricts access to authenticated users.

### Dashboard

The dashboard displays financial summaries, charts, metrics, and recent transactions.

```text
src/components/dashboard/
├── DashboardCharts.jsx
├── DashboardFooter.jsx
├── DashboardHeader.jsx
├── DashboardMetricCards.jsx
└── DashboardTransactions.jsx
```

### Administration

Administrators can manage users and access codes.

```text
src/components/admin/
├── AdminAddCodeForm.jsx
├── AdminAddUserForm.jsx
├── AdminCodesTab.jsx
├── AdminHeader.jsx
└── AdminUsersTab.jsx
```

## Frontend Pages

| Page | Description |
|---|---|
| `Login.jsx` | User authentication |
| `Dashboard.jsx` | Financial overview |
| `Transactions.jsx` | Transaction management |
| `FiscalYears.jsx` | Fiscal-year management |
| `Users.jsx` | User management |
| `Codes.jsx` | Access-code management |
| `Settings.jsx` | Account settings |
| `ChangePassword.jsx` | Password changes |
| `Admin.jsx` | Administrative functions |

## Backend

The backend handles API requests, authentication, database operations, and server-side business logic.

```text
backend/
├── index.js
├── db.js
├── clear_db.js
└── package.json
```

| File | Description |
|---|---|
| `index.js` | Starts the server and defines API functionality |
| `db.js` | Configures database access |
| `clear_db.js` | Clears or resets database data |
| `package.json` | Defines backend dependencies and scripts |

## Application Flow

1. The user opens the frontend application.
2. The user authenticates through the login page.
3. `AuthContext` stores the authentication state.
4. `ProtectedRoute` protects restricted pages.
5. The dashboard loads financial data from the backend.
6. Users manage transactions and fiscal years.
7. Administrators manage users and access codes.
8. The backend stores and retrieves application data.

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend and backend should run simultaneously during development.

## Database

Database configuration is handled in `backend/db.js`.

The `clear_db.js` script can be used to reset development data. Use it carefully because it may permanently delete stored records.

## Security

- Protect authenticated routes.
- Restrict administrative operations by user role.
- Never store passwords in plain text.
- Store secrets and database credentials in environment variables.
- Do not use database reset scripts in production.
- Validate all data received by the backend.

## Project Status

The project is structured as a full-stack finance tracking system with separate frontend and backend applications.

## License

No license has been specified.
