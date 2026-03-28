const User = require("../models/user.model");

/**
 * Retrieves all users from the database
 */
async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send("Internal Server Error retrieving users");
  }
}

/**
 * Creates a new user in the database
 */
async function createUser(req, res) {
  try {
    // Note: _id is explicitly required by the User schema to be a Number
    const { _id, name, age, city } = req.body;

    // Validate required fields
    if (!_id || !name || !age || !city) {
      return res
        .status(400)
        .send("All fields (_id, name, age, city) are required");
    }

    // Create the user document
    const user = await User.create({ _id: Number(_id), name, age, city });
    return res.status(201).send(user);
  } catch (error) {
    return res.status(500).send("Internal Server Error creating user");
  }
}

/**
 * Retrieves a single user by their ID
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(Number(id));

    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send("Internal Server Error retrieving user");
  }
}

/**
 * Updates an existing user by their ID
 */
async function updateUserById(req, res) {
  try {
    const { id } = req.params;
    const { name, age, city } = req.body;

    // Validate required fields
    if (!name || !age || !city) {
      return res.status(400).send("All fields (name, age, city) are required");
    }

    // Find and update the document, returning the modified version
    const user = await User.findByIdAndUpdate(
      Number(id),
      { name, age, city },
      { new: true }, // Return the updated document
    );

    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send("Internal Server Error updating user");
  }
}

/**
 * Deletes a user by their ID
 */
async function deleteUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(Number(id));

    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send("Internal Server Error deleting user");
  }
}

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
