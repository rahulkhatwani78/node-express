const Order = require("../models/order.model");

/**
 * Common aggregation pipeline stages used across analytics endpoints.
 * - Matches orders that are not cancelled
 * - Unwinds the items array to process individual products
 * - Looks up product details from the products collection
 * - Unwinds the resulting product array
 */
const commonPipeline = [
  {
    $match: {
      status: {
        $ne: "cancelled",
      },
    },
  },
  {
    $unwind: "$items",
  },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product",
    },
  },
  {
    $unwind: "$product",
  },
];

/**
 * Calculates the total revenue across all non-cancelled orders.
 */
async function getTotalRevenue(req, res) {
  try {
    const totalRevenue = await Order.aggregate([
      ...commonPipeline,
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $multiply: ["$items.quantity", "$product.price"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
        },
      },
    ]);
    return res.status(200).send(totalRevenue[0] || { totalRevenue: 0 });
  } catch (error) {
    console.error("Error in getTotalRevenue:", error);
    return res
      .status(500)
      .send("Internal Server Error calculating total revenue");
  }
}

/**
 * Calculates total sales segmented by product category.
 */
async function getSalesByCategory(req, res) {
  try {
    const salesByCategory = await Order.aggregate([
      ...commonPipeline,
      {
        $group: {
          _id: "$product.category",
          totalRevenue: {
            $sum: {
              $multiply: ["$items.quantity", "$product.price"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalRevenue: 1,
        },
      },
    ]);
    return res.status(200).send(salesByCategory);
  } catch (error) {
    console.error("Error in getSalesByCategory:", error);
    return res
      .status(500)
      .send("Internal Server Error calculating sales by category");
  }
}

/**
 * Identifies the user who has spent the most money across all their non-cancelled orders.
 */
async function getTopSpendingUser(req, res) {
  try {
    const topSpendingUser = await Order.aggregate([
      ...commonPipeline,
      {
        $group: {
          _id: "$userId",
          totalSpending: {
            $sum: {
              $multiply: ["$items.quantity", "$product.price"],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          totalSpending: 1,
          userName: "$user.name",
        },
      },
      {
        $sort: {
          totalSpending: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
    return res.status(200).send(topSpendingUser[0] || null);
  } catch (error) {
    console.error("Error in getTopSpendingUser:", error);
    return res
      .status(500)
      .send("Internal Server Error calculating top spending user");
  }
}

module.exports = {
  getTotalRevenue,
  getSalesByCategory,
  getTopSpendingUser,
};
