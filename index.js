const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

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
        const collection = db.collection("lawyer");

        const lawyers = await collection.find().toArray();
        res.json(lawyers);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching lawyers",
            error: error.message,
        });
    }
});

// GET single lawyer by ID (optional but useful)
app.get("/lawyers/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("lawyer");

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
app.put("/lawyers/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("lawyer");

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
        const collection = db.collection("lawyer");

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