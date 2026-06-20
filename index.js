const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

// MongoDB URI from .env
const uri = process.env.MONGODB_URI;

// Create MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let database;

// Connect to MongoDB
async function run() {
    try {
        await client.connect();

        database = client.db("legaleasy"); // database name

        console.log("Connected to MongoDB successfully!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

run();

// ================= ROUTES =================

// Root route
app.get('/', (req, res) => {
    res.send('Server is running...');
});

// Get all lawyers
app.get('/lawyers', async (req, res) => {
    try {
        const collection = database.collection("lawyer"); // collection name
        const data = await collection.find().toArray();

        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching lawyers",
            error: error.message
        });
    }
});

// Update lawyer by ID
const { ObjectId } = require("mongodb"); // add this at top

app.put('/lawyers/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const collection = database.collection("user"); // FIXED

        const result = await collection.updateOne(
            { _id: new ObjectId(id) }, // FIXED
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Lawyer not found" });
        }

        res.json({ message: "Lawyer updated successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error updating lawyer",
            error: error.message
        });
    }
});





// ================= START SERVER =================
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});