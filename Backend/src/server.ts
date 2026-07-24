require("dotenv").config();

const express = require("express");
const { connectDB } = require("./config/db.config");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Hello from Appointment System API"
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();