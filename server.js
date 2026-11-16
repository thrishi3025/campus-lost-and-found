require("dotenv").config();

const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo").MongoStore;

const app = express();
const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MongoDB connection string is missing from .env");
    process.exit(1);
}

const client = new MongoClient(MONGO_URI);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        dbName: "campusLostFound",
        collectionName: "sessions"
    }),
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.static(path.join(__dirname, "public")));


let database;
// POST: Submit a claim for a found item
app.post("/api/claims", requireLogin, async (req, res) => {
    try {
        const { itemId, reason } = req.body;

        if (!itemId || !reason || !reason.trim()) {
            return res.status(400).json({
                message: "Item ID and claim reason are required."
            });
        }

        if (!ObjectId.isValid(itemId)) {
            return res.status(400).json({
                message: "Invalid item ID."
            });
        }

        const item = await database.collection("items").findOne({
            _id: new ObjectId(itemId),
            type: "Found"
        });

        if (!item) {
            return res.status(404).json({
                message: "Found item not found."
            });
        }

        const newClaim = {
            itemId: new ObjectId(itemId),
            itemName: item.itemName,
            studentId: req.session.user.id,
            studentName: req.session.user.name,
            studentEmail: req.session.user.email,
            reason: reason.trim(),
            status: "Pending",
            createdAt: new Date()
        };

        const result = await database.collection("claims").insertOne(newClaim);

        res.status(201).json({
            message: "Claim submitted successfully!",
            claimId: result.insertedId
        });

    } catch (error) {
        console.error("Claim error:", error);

        res.status(500).json({
            message: "Could not submit claim."
        });
    }
});

// Middleware to check whether a student is logged in
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    next();
}

// Check whether a student is logged in
app.get("/api/me", requireLogin, (req, res) => {
    res.json({
        user: req.session.user
    });
});

// Middleware to allow only admins
function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    if (req.session.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access only"
        });
    }

    next();
}

async function connectDatabase() {
    await client.connect();
    database = client.db("campusLostFound");
    console.log("MongoDB connected successfully!");
}

// API home route
app.get("/api", (req, res) => {
    res.json({
        message: "Campus Lost and Found Portal API is working!"
    });
});

// Test route
app.get("/test", (req, res) => {
    console.log("TEST ROUTE WORKING");
    res.send("Server is receiving requests!");
});

// GET: Retrieve items with search and filters
app.get("/api/items", async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const type = req.query.type || "";
        const category = req.query.category || "";
        const location = (req.query.location || "").trim();

        console.log("Location received:", req.query.location);

        const filter = {};

        if (search !== "") {
            filter.$or = [
                { itemName: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (type === "Lost" || type === "Found") {
            filter.type = type;
        }

        if (category.trim() !== "") {
            filter.category = category.trim();
        }

        if (location !== "") {
            filter.location = {
                $regex: location,
                $options: "i"
            };
        }

        const items = await database
            .collection("items")
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(items);

    } catch (error) {
        console.error("Fetch error:", error.message);

        res.status(500).json({
            message: "Could not retrieve items"
        });
    }
});

// POST: Add a new item
app.post("/api/items", requireLogin, async (req, res) => {
    console.log("REGISTER ROUTE CALLED");
    try {
        const {
            type,
            itemName,
            category,
            description,
            location,
            date
        } = req.body;

        if (
            !type ||
            !itemName ||
            !category ||
            !description ||
            !location ||
            !date
        ) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        if (type !== "Lost" && type !== "Found") {
            return res.status(400).json({
                message: "Type must be Lost or Found."
            });
        }

        const newItem = {
            type,
            itemName: itemName.trim(),
            category: category.trim(),
            description: description.trim(),
            location: location.trim(),
            date,
            studentId: req.session.user.id,
            studentName: req.session.user.name,
            createdAt: new Date()
        };

        const result = await database
            .collection("items")
            .insertOne(newItem);

        res.status(201).json({
            message: "Report saved successfully!",
            itemId: result.insertedId
        });

    } catch (error) {
        console.error("Save error:", error.message);

        res.status(500).json({
            message: "Could not save item"
        });
    }
});

// GET: View claims submitted by the logged-in student
app.get("/api/my-claims", requireLogin, async (req, res) => {
    try {
        const claims = await database.collection("claims")
            .find({
                studentId: req.session.user.id
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(claims);

    } catch (error) {
        console.error("Fetch claims error:", error);

        res.status(500).json({
            message: "Could not fetch your claims."
        });
    }
});

// GET: View items reported by the logged-in student
app.get("/api/my-items", requireLogin, async (req, res) => {
    try {
        const items = await database.collection("items")
            .find({
                studentId: req.session.user.id
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(items);

    } catch (error) {
        console.error("Fetch my items error:", error);

        res.status(500).json({
            message: "Could not fetch your items."
        });
    }
});


// GET: View all student claims (Admin only)
app.get("/api/admin/claims", requireAdmin, async (req, res) => {
    try {
        const claims = await database.collection("claims")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(claims);

    } catch (error) {
        console.error("Admin claims error:", error);

        res.status(500).json({
            message: "Could not fetch claims."
        });
    }
});

// GET: Fetch all reported items for admin
app.get("/api/admin/items", requireAdmin, async (req, res) => {
    try {
        const items = await database.collection("items")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(items);

    } catch (error) {
        console.error("Fetch admin items error:", error);

        res.status(500).json({
            message: "Could not fetch reported items."
        });
    }
});


// PATCH: Approve or reject a student claim (Admin only)
app.patch("/api/admin/claims/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid claim ID."
            });
        }

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Approved or Rejected."
            });
        }

        const result = await database.collection("claims").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: status,
                    reviewedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Claim not found."
            });
        }

        res.json({
            message: `Claim ${status.toLowerCase()} successfully!`
        });

    } catch (error) {
        console.error("Update claim error:", error);

        res.status(500).json({
            message: "Could not update claim."
        });
    }
});


// DELETE: Remove an item (Admin only)
app.delete("/api/items/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid item ID"
            });
        }

        const result = await database.collection("items").deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Item deleted successfully!"
        });

    } catch (error) {
        console.error("Delete error:", error.message);

        res.status(500).json({
            message: "Could not delete item"
        });
    }
});


// POST: Register a new student
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const users = database.collection("users");
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await users.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await users.insertOne({
           name: name.trim(),
           email: normalizedEmail,
           password: hashedPassword,
           role: "student",
           createdAt: new Date()
        });

        res.status(201).json({
            message: "Registration successful!"
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// POST: Student login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await database.collection("users").findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        req.session.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "student"
        };

        res.json({
            message: "Login successful!",
            user: req.session.user
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// POST: Student logout
app.post("/api/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logged out successfully!"
        });
    });
});


// Start server
async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
