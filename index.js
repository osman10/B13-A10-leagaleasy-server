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
        // console.log(payload);
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


// GET all admin
app.get("/admin", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("user");
        const Admin = await collection.find({ role: "Admin" }).toArray();
        res.status(200).json(Admin);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching Admin",
            error: error.message,
        });
    }
});

// GET single admin by ID (optional but useful)
app.get("/admin/:id", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("user");

        const admin = await collection.findOne({
            _id: new ObjectId(req.params.id),
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json(admin);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching lawyer",
            error: error.message,
        });
    }
});


// GET all lawyers
// app.get("/lawyers", async (req, res) => {
//     try {
//         const db = await connectDB();
//         const collection = db.collection("user");
//         const lawyers = await collection.find({ role: "Lawyer" }).toArray();
//         res.status(200).json(lawyers);
//     } catch (error) {
//         res.status(500).json({
//             message: "Error fetching lawyers",
//             error: error.message,
//         });
//     }
// });
// GET all lawyers by reverse order
app.get("/lawyers", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("user");

    const lawyers = await collection
      .find({ role: "Lawyer" })
      .sort({ createdAt: -1 }) // DESCENDING
      .toArray();

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
app.patch("/lawyers/:id", verifyToken, async (req, res) => {
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
app.delete("/lawyers/:id", verifyToken, async (req, res) => {
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


// GET all clients
app.get("/clients", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("user");
        const Client = await collection.find({ role: "Client" }).toArray();
        res.status(200).json(Client);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching Client",
            error: error.message,
        });
    }
});
// GET single client by ID (optional but useful)
app.get("/clients/:id", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("user");

        const client = await collection.findOne({
            _id: new ObjectId(req.params.id),
        });

        if (!client) {
            return res.status(404).json({ message: "client not found" });
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching lawyer",
            error: error.message,
        });
    }
});

// Hiring request
app.post("/hiring-info", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const hiringCollection = db.collection("hiringInfo");

        const hiringInfo = req.body;

        const result = await hiringCollection.insertOne({
            ...hiringInfo,
            createdAt: new Date(),
        });

        res.status(201).json({
            success: true,
            message: "Consultation booked successfully",
            insertedId: result.insertedId,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create hiring request",
            error: error.message,
        });
    }
});


// GET all hiring info
app.get("/hiring-info", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("hiringInfo");

        const hiringInfo = await collection.find().toArray();

        res.status(200).json(hiringInfo);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching hiringInfo",
            error: error.message,
        });
    }
});


// POST lawyer comment
app.post("/lawyers/comment", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("comments");

        const { lawyerId, userId, comment, userImg } = req.body;

        if (!lawyerId || !comment) {
            return res.status(400).json({
                message: "lawyerId and comment are required",
            });
        }

        const newComment = {
            lawyerId, // store as string safely
            userId: userId || null,
            comment,
            userImg,
            createdAt: new Date(),
        };

        const result = await collection.insertOne(newComment);

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            insertedId: result.insertedId,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add comment",
            error: error.message,
        });
    }
});


// GET comments for a specific lawyer
app.get("/lawyers/comment/:lawyerId", verifyToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("comments");

        const { lawyerId } = req.params;

        const comments = await collection
            .find({ lawyerId })
            .sort({ createdAt: -1 }) // newest first
            .toArray();

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch comments",
            error: error.message,
        });
    }
});


// Single Client Math the hiring info
app.get("/hiring-info/approved", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("hiringInfo");

    const { lawyerId, clientId } = req.query;

    const result = await collection.find({
      lawyerId,
      clientId,
      status: "Approved",
    }).toArray();

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT || 5000}`);
});

// ===================== EXPORT (IMPORTANT FOR VERCEL) =====================
module.exports = app;