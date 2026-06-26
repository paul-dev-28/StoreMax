# StoreMax

StoreMax is a full-stack inventory and sales management system built using the MERN stack. It enables businesses to manage products, customers, inventory, and sales from a centralized dashboard while providing secure authentication and user-specific data isolation.

The application is designed to simplify inventory operations, automate stock updates during sales, and provide business insights through an intuitive interface.

---

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Protected routes
- User-specific data isolation

### Product Management

- Add, edit, and delete products
- Track purchase price and selling price
- Manage inventory quantities
- Categorize products
- Search products

### Customer Management

- Add, edit, and delete customers
- Store customer contact information
- Maintain customer records

### Sales Management

- Create sales invoices
- Sell multiple products in a single transaction
- Automatic inventory updates
- Prevent sales when stock is insufficient
- Calculate invoice totals automatically

### Dashboard

- Total products
- Total customers
- Total sales
- Total revenue
- Low stock summary

---

## Tech Stack

### Frontend

- React
- React Router
- Axios
- React Icons
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

---

## Project Structure

```text
StoreMax
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/storemax.git
cd storemax
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file.

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server.

```bash
npm run dev
```

### Frontend

Open another terminal.

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```
http://localhost:5173
```

---

## Technologies Used

| Category | Technologies |
|----------|--------------|
| Frontend | React, React Router, Axios, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Development Tools | Vite, Nodemon |

---

## Current Functionality

- Secure user authentication
- Product management
- Customer management
- Inventory management
- Sales creation
- Automatic stock deduction
- Revenue calculation
- Dashboard analytics
- Multi-user data isolation

---

## Planned Features

- Customer order history
- Invoice details page
- PDF invoice generation
- Payment tracking
- Balance due management
- Revenue analytics
- Monthly and yearly sales reports
- Best-selling products
- Low-stock notifications
- Product category navigation
- Advanced filtering and pagination
