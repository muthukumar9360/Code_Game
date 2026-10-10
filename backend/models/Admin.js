import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "Administrator",
  },
  role: {
    type: String,
    default: "admin",
  },
  addedBy: {
    type: String,
    default: "system",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Admin", adminSchema);