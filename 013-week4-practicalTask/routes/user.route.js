const express = require("express");
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/user.controller");
const router = express.Router();

router.get("/", getAllUsers).post("/", createUser);

router
  .get("/:id", getUserById)
  .put("/:id", updateUserById)
  .delete("/:id", deleteUserById);

module.exports = router;
