# Week 4 Practical Task - Analytics API and MongoDB Replication

## 📝 Task Overview

The goal of this practical task is to build a robust RESTful API using **Node.js, Express, and MongoDB (Mongoose)**. The application handles user management and provides complex E-commerce analytics by performing MongoDB Aggregation queries across multiple related collections (`User`, `Product`, and `Order`).

## 🗄️ Database Models

The database consists of three main collections with the following structures:

### 1. User

- `_id` (Number, required) - Unique identifier for the user.
- `name` (String, required) - Full name of the user.
- `age` (Number, required) - Age of the user.
- `city` (String, required) - User's residential city.
- `isPremium` (Boolean, default: false) - Premium membership status.

### 2. Product

- `_id` (Number, required) - Unique identifier for the product.
- `name` (String, required) - Name of the product.
- `category` (String, required) - Category to which the product belongs.
- `price` (Number, required) - Price of the product.

### 3. Order

- `_id` (Number, required) - Unique identifier for the order.
- `userId` (Number, required) - Reference to the user who placed the order.
- `status` (String, required) - Order status (e.g., 'completed', 'cancelled').
- `createdAt` (Date, default: Date.now) - Order placement timestamp.
- `items` (Array, required) - Array of localized objects representing purchased items (each containing `productId` and `quantity`).

---

## 🚀 API Endpoints

### User Management API (`/api/user`)

Handles standard CRUD operations for managing system users.

| Method     | Endpoint        | Description                                                |
| :--------- | :-------------- | :--------------------------------------------------------- |
| **GET**    | `/api/user`     | Fetch a list of all users.                                 |
| **POST**   | `/api/user`     | Create a new user (Requires `_id`, `name`, `age`, `city`). |
| **GET**    | `/api/user/:id` | Fetch a specific user by their ID.                         |
| **PUT**    | `/api/user/:id` | Update an existing user's details by their ID.             |
| **DELETE** | `/api/user/:id` | Delete a specific user by their ID.                        |

### Analytics API (`/api/analytics`)

Implements advanced MongoDB Aggregation pipelines involving `$lookup`, `$unwind`, and `$group` logic to calculate essential business metrics, specifically excluding `cancelled` orders.

| Method  | Endpoint                           | Description                                                                                           |
| :------ | :--------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **GET** | `/api/analytics/total-revenue`     | Calculates and returns the total revenue generated from all non-cancelled orders across the platform. |
| **GET** | `/api/analytics/sales-by-category` | Returns the total sales revenue grouped by product category.                                          |
| **GET** | `/api/analytics/top-spending-user` | Identifies and returns the user who has spent the most money across all their non-cancelled orders.   |

## 🛠️ Enhancements & Optimizations applied

- Included full `try/catch` error handling logic to prevent unexpected server crashes and properly communicate `500 Internal Server Error` status codes.
- Added structured parameter and body validation (e.g. enforcing data validity during User Creation/Update).
- Refactored and modularized MongoDB Aggregation pipelines inside the Analytics controller by utilizing a shared common pipeline (`commonPipeline`) for readability and keeping it DRY.
- **Architectural Update**: Enforced strict Model-Controller-Route naming conventions for better IDE navigation and scalability (e.g., `user.model.js`, `user.controller.js`, `user.route.js`).

## ▶️ Setup & Usage

1. Make sure to define your MongoDB connection string inside the `.env` file (`MONGO_URI`).
2. Install dependencies: `npm install`
3. **Optional (Seed Database)**: If you are running this app for the first time and want to populate your empty collections with dummy `Users`, `Products`, and `Orders` data, run:
   ```bash
   node seed.js
   ```
4. Run the application: `npm start`
5. The server runs on port `3000` by default. Requests will be logged automatically to `logs.txt` using a custom file system middleware.

---

## 🔄 MongoDB Replication Setup (Local Testing)

If you'd like to test the application using a local MongoDB Replica Set (which is fully supported by this project), follow these steps:

### 1. Create Data Directories

Open your terminal and create three separate directories to hold the data for each node:

```bash
mkdir db1 db2 db3
```

### 2. Start the MongoDB Instances

Open **three separate terminal windows** and start instances on different ports, all belonging to the same replica set (`rs1`):

**Terminal 1:**

```bash
mongod --port 27018 --dbpath db1 --replSet rs1
```

**Terminal 2:**

```bash
mongod --port 27019 --dbpath db2 --replSet rs1
```

**Terminal 3:**

```bash
mongod --port 27020 --dbpath db3 --replSet rs1
```

### 3. Initialize the Replica Set

Open another terminal window, connect to the first node using the MongoDB shell, and initiate the replica set:

```bash
mongosh --port 27018
```

Run the following command inside the `mongosh` environment:

```javascript
rs.initiate({
  _id: "rs1",
  members: [
    { _id: 0, host: "localhost:27018" },
    { _id: 1, host: "localhost:27019" },
    { _id: 2, host: "localhost:27020" },
  ],
});
```

_Tip: You can verify the status is healthy using `rs.status();`._

### 4. Update the `.env` Connection String

Once the replica set is fully initiated, update your `MONGO_URI` inside the `.env` file so the Node.js application connects correctly:

```env
MONGO_URI="mongodb://localhost:27018,localhost:27019,localhost:27020/ecommerce?replicaSet=rs1"
```
