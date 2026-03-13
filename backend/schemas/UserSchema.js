const { Schema } = require("mongoose");

const UserSchema = new Schema({
  userName: { type: String, required: true },  // ← FIXED: name → userName
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

module.exports = { UserSchema };


