import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import adminAuth from "../middleware/Adminauth.js";

const router = express.Router();

// Helper to hash passwords using SHA-256
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Auto-seed default master admin in database if not present
const ensureMasterAdminInDB = async () => {
  try {
    const masterUser = (process.env.ADMIN_USERNAME || "muthukumar_9360").toLowerCase();
    const masterPass = process.env.ADMIN_PASSWORD || "Muthukumar12";

    const existing = await Admin.findOne({ username: masterUser });
    if (!existing) {
      await Admin.create({
        username: masterUser,
        passwordHash: hashPassword(masterPass),
        name: "Master Admin (Muthukumar)",
        role: "admin",
        addedBy: "system"
      });
      console.log(`✅ Seeded Master Admin [${masterUser}] into MongoDB`);
    }
  } catch (err) {
    console.error("Master admin seeding error:", err.message);
  }
};

// Initialize seeding on module load
ensureMasterAdminInDB();

// Admin Login (Validates strictly against MongoDB Admin Collection)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Look up admin in MongoDB
    let admin = await Admin.findOne({ username: cleanUsername });

    // Fallback: If DB is empty, run seed and re-fetch
    if (!admin) {
      await ensureMasterAdminInDB();
      admin = await Admin.findOne({ username: cleanUsername });
    }

    // 2. Fallback check against process.env credentials
    const envMasterUser = (process.env.ADMIN_USERNAME || "muthukumar_9360").toLowerCase();
    const envMasterPass = process.env.ADMIN_PASSWORD || "Muthukumar12";

    let isValid = false;
    if (admin) {
      // Check hashed password or plain text match
      isValid =
        admin.passwordHash === hashPassword(cleanPassword) ||
        admin.passwordHash === cleanPassword;
    } else if (cleanUsername === envMasterUser && cleanPassword === envMasterPass) {
      isValid = true;
      // Auto-persist into MongoDB
      admin = await Admin.create({
        username: envMasterUser,
        passwordHash: hashPassword(envMasterPass),
        name: "Master Admin",
        role: "admin"
      }).catch(() => null);
    }

    if (!isValid) {
      return res.status(401).json({ message: "Invalid Admin Credentials" });
    }

    const token = jwt.sign(
      {
        id: admin?._id,
        username: admin?.username || cleanUsername,
        role: "admin"
      },
      process.env.JWT_SECRET || "DineshBabu",
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin?._id,
        username: admin?.username || cleanUsername,
        name: admin?.name || "Administrator",
        role: "admin"
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server authorization error" });
  }
});

// GET all admins from MongoDB (Admin only)
router.get("/all-admins", adminAuth, async (req, res) => {
  try {
    const admins = await Admin.find({}, "-passwordHash").sort({ createdAt: -1 });
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new admin friend to MongoDB (Admin only)
router.post("/add-admin", adminAuth, async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await Admin.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({ error: "An admin with this username already exists" });
    }

    const newAdmin = await Admin.create({
      username: cleanUsername,
      passwordHash: hashPassword(password.trim()),
      name: (name || "Admin Member").trim(),
      role: "admin",
      addedBy: req.user?.username || "admin"
    });

    res.status(201).json({
      success: true,
      message: `Admin [${cleanUsername}] added successfully to database.`,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove an admin from MongoDB (Admin only)
router.delete("/remove-admin/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const targetAdmin = await Admin.findById(id);

    if (!targetAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Protect master admin from being deleted
    if (targetAdmin.username === "muthukumar_9360") {
      return res.status(403).json({ error: "Cannot delete the primary master administrator account." });
    }

    await Admin.findByIdAndDelete(id);
    res.json({ success: true, message: `Admin [${targetAdmin.username}] removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
