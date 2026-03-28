const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routes/user.route");
const analyticsRouter = require("./routes/analytics.route");
const { connectMongoDB } = require("./connection");
const { logRequest } = require("./middlewares");

const app = express();
const PORT = 3000;

dotenv.config();

// Connect to MongoDB
connectMongoDB(process.env.MONGO_URI);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logRequest("logs.txt"));

// Routes
app.use("/api/user", userRouter);
app.use("/api/analytics", analyticsRouter);

// Start Server
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
