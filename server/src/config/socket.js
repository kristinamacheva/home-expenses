const socketIO = require('socket.io');
const http = require('http');
const socketAuthMiddleware = require("../middlewares/socketAuthMiddleware");

let io;

function initializeSocket(app) {
    // Create an HTTP server instance that can be used by both Express and Socket.io
    const server = http.createServer(app);

    // Initialize Socket.io on the created HTTP server instance
    io = socketIO(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:4173", "http://192.168.56.1:4173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware to authenticate socket connections
    // Runs whenever a client tries to connect to the Socket.io server 
    // It checks the client’s authentication status and either allows the connection or rejects it
    io.use(socketAuthMiddleware);

    // Event handler for when a client connects via Socket.io
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Store connected sockets by userId
        // global object io.userSockets is used to keep track of active connections
        if (!io.userSockets) {
            io.userSockets = {};
        }

        // If there are no active connections for a user, an array is created to hold their connections
        if (!io.userSockets[socket.userId]) {
            io.userSockets[socket.userId] = [];
        }
        
        io.userSockets[socket.userId].push(socket);

        // console.log(io.userSockets);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
            io.userSockets[socket.userId] = io.userSockets[socket.userId].filter(s => s !== socket);
            if (io.userSockets[socket.userId].length === 0) {
                delete io.userSockets[socket.userId];
            }
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
    if (!io.userSockets) {
        // No active socket connections
        // console.log('No active socket connections.');
        return;
    }

    const sockets = io.userSockets[userId];
    if (!sockets || sockets.length === 0) {
        // console.log(`No active socket connections for user ${userId}.`);
        // No active socket connections for this user
        return;
    }

    // Emit the "notification" event to each socket connection of the user
    sockets.forEach(socket => {
        socket.emit("notification", notification);
    });
}

// Export the functions and objects needed for Socket.io functionality
module.exports = { initializeSocket, getIO, sendNotificationToUser };
