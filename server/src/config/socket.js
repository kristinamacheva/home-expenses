const socketIO = require('socket.io');
const http = require('http');
const socketAuthMiddleware = require("../middlewares/socketAuthMiddleware");

let io;

function initializeSocket(app) {
    const server = http.createServer(app);
    io = socketIO(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:4173", "http://192.168.56.1:4173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(socketAuthMiddleware);

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

    app.set("io", io);
    app.set("server", server);

    return server;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

function sendNotificationToUser(userId, notification) {
    if (!io.userSockets) {
        // console.log('No active socket connections.');
        return;
    }

    const sockets = io.userSockets[userId];
    if (!sockets || sockets.length === 0) {
        // console.log(`No active socket connections for user ${userId}.`);
        return;
    }

    sockets.forEach(socket => {
        socket.emit("notification", notification);
    });
}

module.exports = { initializeSocket, getIO, sendNotificationToUser };
