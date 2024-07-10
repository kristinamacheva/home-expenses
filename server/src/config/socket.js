const socketIO = require("socket.io");
const http = require("http");
const socketAuthMiddleware = require("../middlewares/socketAuthMiddleware");

let io;

function initializeSocket(app) {
    // Create an HTTP server instance that can be used by both Express and Socket.io
    const server = http.createServer(app);

    // Initialize Socket.io on the created HTTP server instance
    io = socketIO(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://localhost:4173",
                "http://192.168.56.1:4173",
            ],
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Middleware to authenticate socket connections
    io.use(socketAuthMiddleware);

    // Event handler for when a client connects via Socket.io
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join a room named after the userId
        socket.join(socket.userId);
        console.log(`User joined room: ${socket.userId}`);

        socket.on("disconnect", () => {
            socket.leave(socket.userId);
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    // Store the Socket.io server and HTTP server instances in Express's app settings
    app.set("io", io);
    app.set("server", server);

    // Return the HTTP server instance, which can be useful for further configurations or listening
    return server;
}

// Function to retrieve the Socket.io instance
function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

// Function to send a notification to a specific user
function sendNotificationToUser(userId, notification) {
    if (!io) {
        console.log("Socket.io not initialized");
        return;
    }

    // Ensure userId is a string
    const userIdString = userId.toString();

    // Emit the "notification" event to the room corresponding to the userId
    io.to(userIdString).emit("notification", notification);
}

// Export the functions and objects needed for Socket.io functionality
module.exports = { initializeSocket, getIO, sendNotificationToUser };
