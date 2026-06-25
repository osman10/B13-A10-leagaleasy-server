# LegalEase - Server

## 📌 Project Overview

The LegalEase Server provides RESTful APIs for the LegalEase lawyer hiring platform. It manages authentication, role-based authorization, lawyer services, hiring requests, payments, comments, analytics, and transaction management.




## 🎯 Features

### Authentication

* JWT Authentication
* Google OAuth Integration
* Protected Routes
* Role Verification Middleware

### User Management

* Register User
* Login User
* Update Profile
* Manage Roles

### Lawyer Management

* Create Legal Service
* Update Service
* Delete Service
* Publish/Unpublish Services

### Hiring System

* Send Hiring Request
* Accept Request
* Reject Request
* Hiring History Tracking

### Payment Management

* Stripe Payment Processing
* Transaction Recording
* Payment Status Updates

### Comment System

* Create Comment
* Update Comment
* Delete Comment
* Verify Hired Users

### Admin Features

* Manage Users
* Manage Lawyers
* View Transactions
* Platform Analytics

### Analytics

* Total Users
* Total Lawyers
* Total Hires
* Total Revenue

---

## 🛠️ Technologies Used

* Node.js
* Express.js
* MongoDB
* JWT
* CORS
* Dotenv

---

## 📦 NPM Packages

```json
{
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "jose-cjs": "^6.2.3",
  "jsonwebtoken": "^9.0.3",
  "mongodb": "^7.3.0",
  "nodemon": "^3.1.14"
}
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone <server-repository-url>
cd legalease-server
```

### Install Dependencies

```bash
npm install
```



## ▶️ Run Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## 📂 API Modules

```bash
├── Authentication
├── Users
├── Lawyers
├── Hiring Requests
├── Comments
├── Payments
├── Transactions
├── Analytics
└── Admin Controls
```

---

## 🔑 API Security

### JWT Middleware

Protected endpoints require:

```http
Authorization: Bearer <token>
```

### Role-Based Access

```javascript
Admin Only
Lawyer Only
User Only
```

---

## 📊 Database Collections

```bash
users
lawyers
hiringRequests
comments
payments
transactions
reviews
```

---

## 📈 Analytics Endpoints

* Total Users
* Total Lawyers
* Total Hires
* Total Revenue

---

## 🌟 Deployment Notes

* MongoDB credentials stored in environment variables.
* JWT secret secured via environment variables.
* CORS configured for production deployment.
* Supports route refresh without 404 errors.
* Secure role-based API access.

---

## 👨‍💻 Developer

Osman Goni , Developer of Backend API for the LegalEase Lawyer Hiring Platform.

© 2026 LegalEase. All Rights Reserved.
