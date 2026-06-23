# Splitly

**Splitly** is a full-stack expense-sharing application that simplifies group expense management and settlement tracking. Built using the MERN stack, it enables users to create groups, record shared expenses, track balances, and settle debts efficiently through a modern and intuitive interface.

## Features

* Secure user authentication using JWT and bcrypt
* Create and manage expense-sharing groups
* Add and track shared expenses within groups
* Automatic equal expense distribution among group members
* Real-time balance calculations showing outstanding debts
* Settlement recording to clear balances
* Responsive dark-themed user interface

## Technology Stack

| Layer             | Technology          |
| ----------------- | ------------------- |
| Frontend          | React 18, Vite      |
| Backend           | Node.js, Express.js |
| Database          | MongoDB, Mongoose   |
| Authentication    | JWT, bcryptjs       |
| API Communication | Axios               |
| Routing           | React Router        |

## Architecture

### Backend

* RESTful API built with Express.js
* JWT-based authentication middleware
* MongoDB data persistence using Mongoose ODM
* Modular route and model structure

### Frontend

* React-based single-page application
* Context API for global authentication state
* Reusable component architecture
* Protected routes and authenticated workflows

## Core Modules

### Authentication

* User registration
* User login
* Session management
* Protected API access

### Group Management

* Create groups
* View joined groups
* Delete groups
* Manage group members

### Expense Management

* Add shared expenses
* View group expense history
* Delete expenses
* Automatic equal split calculations

### Settlement Tracking

* Record settlements between users
* Maintain debt history
* Update balances dynamically

## REST API

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Groups

* `GET /api/groups`
* `POST /api/groups`
* `GET /api/groups/:id`
* `DELETE /api/groups/:id`

### Expenses

* `GET /api/expenses/group/:id`
* `POST /api/expenses`
* `DELETE /api/expenses/:id`

### Settlements

* `GET /api/settlements/group/:id`
* `POST /api/settlements`

## Project Structure

```text
splitly/
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
│
└── client/
    └── src/
        ├── context/
        ├── pages/
        ├── components/
        └── services/
```

## Key Highlights

* Full-stack MERN application
* JWT-secured authentication system
* RESTful API architecture
* MongoDB schema design using Mongoose
* Responsive React frontend
* Real-time balance and settlement calculations

## Future Enhancements

* Unequal expense splitting
* Expense categories and analytics
* Email invitations for groups
* Payment gateway integration
* Multi-currency support
* Activity notifications

## Author

Developed as a portfolio project to demonstrate full-stack web development, REST API design, authentication, database modeling, and state management using the MERN stack.
