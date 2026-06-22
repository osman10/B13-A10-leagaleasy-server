const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};



// ===================== MONGO CONFIG =====================
const uri = process.env.MONGODB_URI;

let client;
let database;

// Reusable DB connection (important for Vercel)
async function connectDB() {
    if (database) return database;

    client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });

    await client.connect();
    database = client.db("legaleasy");

    console.log("✅ Connected to MongoDB");
    return database;
}

// ===================== ROUTES =====================

// Root route
app.get("/", (req, res) => {
    res.send("Server is running...");
});



// GET all lawyers
app.get("/lawyers", async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("user");
        const lawyers = await collection.find({ role: "Lawyer" }).toArray();
         res.status(200).json(lawyers);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching lawyers",
            error: error.message,
        });
    }
});


// GET single lawyer by ID (optional but useful)
app.get("/lawyers/:id", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("user");

    const lawyer = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.json(lawyer);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching lawyer",
      error: error.message,
    });
  }
});


// UPDATE lawyer by ID
app.patch("/lawyers/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("user");

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Lawyer not found" });
        }

        res.json({
            message: "Lawyer updated successfully",
            result,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating lawyer",
            error: error.message,
        });
    }
});



// DELETE lawyer by ID (optional)
app.delete("/lawyers/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("user");

        const result = await collection.deleteOne({
            _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Lawyer not found" });
        }

        res.json({ message: "Lawyer deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting lawyer",
            error: error.message,
        });
    }
});


// app.listen(process.env.PORT || 5000, () => {
//     console.log(`🚀 Server is running on port ${process.env.PORT || 5000}`);
// });

// ===================== EXPORT (IMPORTANT FOR VERCEL) =====================
module.exports = app;