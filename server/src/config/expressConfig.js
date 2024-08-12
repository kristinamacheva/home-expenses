const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { auth } = require("../middlewares/authMiddleware");
const http = require("http"); // Import http module for socket.io
const socketAuthMiddleware = require("../middlewares/socketAuthMiddleware");
const { initializeSocket } = require("./socket");
const ALLOWED_ORIGINS = require("../constants/constants");

function expressConfig(app) {
    // Body Parsing Middleware
    // Parse incoming requests with URL-encoded payloads and JSON payloads
    // Handle form submissions and JSON data in routes
    // Set a limit for request body size (slightly higher than largest expected image size)

    // Middleware to parse URL-encoded bodies (includes query and path parameters from URLs)
    app.use(express.urlencoded({ extended: false, limit: "300kb" }));
    // Middleware to parse JSON bodies
    app.use(express.json({ limit: "300kb" }));

    // CORS configuration
    app.use(
        cors({
            origin: function (origin, callback) {
                // Check if the origin is in the list of allowed origins
                if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                    callback(null, true); // Allow the request
                } else {
                    callback(new Error("Not allowed by CORS")); // Block the request
                }
            },
            credentials: true, // Allow credentials such as cookies, authorization headers
        })
    );

    // Parse cookies attached to the client request object
    app.use(cookieParser());

    // Custom middleware for handling authentication
    app.use(auth);

    // Initialize and configure a Socket.io server instance
    const server = initializeSocket(app);

    // Associate it with the Express application (app) to make the server instance accessible
    // throughout the Express application
    app.set("server", server);
}

module.exports = expressConfig;
