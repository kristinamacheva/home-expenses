const cookie = require("cookie");
const jwt = require("../lib/jwt");
const User = require("../models/User");
const mongoose = require("mongoose");

// invoked only when a client attempts to establish a socket connection
const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies["auth"];

        if (!token) {
            return next(new Error("Authentication error: Token not found"));
        }

        const decodedToken = await jwt.verify(token, process.env.AUTH_ACCESS_TOKEN_SECRET);

        if (!mongoose.Types.ObjectId.isValid(decodedToken._id)) {
            return next(new Error("Authentication error: Invalid user ID format"));
        }

        const user = await User.findById(decodedToken._id);
        if (!user) {
            return next(new Error("Authentication error: User not found"));
        }

        socket.userId = decodedToken._id; // Attach user ID to socket object
        next(); // Allow the connection
    } catch (err) {
        // When Socket.io receives an error from the middleware, it will terminate the connection 
        // attempt and send an error message back to the client
        next(new Error("Authentication error: " + err.message));
    }
};

module.exports = socketAuthMiddleware;
