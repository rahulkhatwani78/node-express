const express = require("express");
const {
  getTotalRevenue,
  getSalesByCategory,
  getTopSpendingUser,
} = require("../controllers/analytics.controller");
const router = express.Router();

router.get("/total-revenue", getTotalRevenue);
router.get("/sales-by-category", getSalesByCategory);
router.get("/top-spending-user", getTopSpendingUser);

module.exports = router;
