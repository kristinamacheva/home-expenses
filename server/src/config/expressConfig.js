const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { auth } = require("../middlewares/authMiddleware");
const http = require("http"); // Import http module for socket.io
const socketAuthMiddleware = require("../middlewares/socketAuthMiddleware");
const { initializeSocket } = require("./socket");

function expressConfig(app) {
    // Set a limit for request body size (slightly higher than largest expected image size)
    app.use(express.urlencoded({ extended: false, limit: "300kb" }));
    app.use(express.json({ limit: "300kb" }));

    // Define allowed origins
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://192.168.56.1:4173",
    ];

    // CORS configuration
    app.use(
        cors({
            origin: function (origin, callback) {
                // Check if the origin is in the list of allowed origins
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true); // Allow the request
                } else {
                    callback(new Error("Not allowed by CORS")); // Block the request
                }
            },
            credentials: true, // Allow credentials such as cookies, authorization headers
        })
    );

    app.use(cookieParser());
    app.use(auth);

    const server = initializeSocket(app);

    app.set("server", server);
}

module.exports = expressConfig;
