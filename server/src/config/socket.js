const socketIO = require("socket.io");
const http = require("http");
const socketAuthMiddleware = require("../middlewares/socketAuthMiddleware");
const Household = require("../models/Household");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const PaidExpense = require("../models/PaidExpense");
const Message = require("../models/Message");
const User = require("../models/User");
const ALLOWED_ORIGINS = require("../constants/constants");
const cloudinary = require("cloudinary").v2;

let io;

async function validateHousehold(socket, householdId) {
    try {
        const household = await Household.findById(householdId);
        if (!household) {
            socket.emit("chat_error", "Домакинството не е намерено.");
            return { isValid: false };
        }

        if (household.archived) {
            socket.emit("chat_error", "Домакинството е архивирано.");
            return { isValid: false };
        }

        if (
            !household.members.some((m) => m.user.toString() === socket.userId)
        ) {
            socket.emit("chat_error", "Не сте член на домакинството.");
            return { isValid: false };
        }

        return { isValid: true, household };
    } catch (error) {
        console.error("Error validating household:", error);
        socket.emit(
            "chat_error",
            "Възникна грешка при проверката на домакинството."
        );
        return { isValid: false };
    }
}

function initializeSocket(app) {
    // Create an HTTP server instance that can be used by both Express and Socket.io
    const server = http.createServer(app);

    // Initialize Socket.io on the created HTTP server instance
    io = socketIO(server, {
        cors: {
            origin: ALLOWED_ORIGINS,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Middleware to authenticate socket connections
    io.use(socketAuthMiddleware);

    // Event handler for when a client connects via Socket.io
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // User joins their personal notification room
        socket.join(socket.userId);
        console.log(`User joined personal room: ${socket.userId}`);

        // Join a household chat room
        socket.on("joinHouseholdChat", async ({ householdId }) => {
            const { isValid, household } = await validateHousehold(
                socket,
                householdId
            );
            if (!isValid) return;

            const room = `household_${householdId}`;
            socket.join(room);
            console.log(
                `User ${socket.userId} joined household chat room: ${room}`
            );
        });

        // Handle sending messages
        socket.on("sendMessage", async ({ householdId, messageData }) => {
            try {
                if (
                    !messageData.text?.trim() &&
                    !messageData.img &&
                    !messageData.resourceType
                ) {
                    return; // Ignore empty messages
                }

                const { isValid, household } = await validateHousehold(
                    socket,
                    householdId
                );
                if (!isValid) return;

                const senderId = socket.userId;
                // Fetch user details from database
                const sender = await User.findById(senderId, {
                    name: 1,
                    avatar: 1,
                    avatarColor: 1,
                });

                if (!sender) throw new Error("Потребителят не е намерен");

                // Create new message
                const newMessage = new Message({
                    household: householdId,
                    sender: senderId,
                });

                if (messageData.text) {
                    newMessage.text = messageData.text;
                }

                if (messageData.img) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        messageData.img
                    );
                    newMessage.img = uploadedResponse.secure_url;
                }

                // Check if the resource exists and belongs to the household
                if (messageData.resourceType && messageData.resourceId) {
                    const validResourceTypes = ["paidExpense", "payment"];
                    if (validResourceTypes.includes(messageData.resourceType)) {
                        let resourceModel;
                        switch (messageData.resourceType) {
                            case "paidExpense":
                                resourceModel = PaidExpense;
                                messageData.resourceType = "PaidExpense";
                                break;
                            case "payment":
                                resourceModel = Payment;
                                messageData.resourceType = "Payment";
                                break;
                            default:
                                throw new Error("Невалиден тип на ресурс");
                        }

                        const resource = await resourceModel.findById(
                            messageData.resourceId
                        );

                        if (
                            !resource ||
                            !resource.household.equals(householdId)
                        ) {
                            throw new Error(
                                "Ресурсът не е намерен или не принадлежи към домакинството"
                            );
                        }

                        newMessage.resourceType = messageData.resourceType;
                        newMessage.resourceId = messageData.resourceId;
                    } else {
                        throw new Error("Невалиден ресурс");
                    }
                }

                await newMessage.save();

                // Prepare data to emit to clients
                const messageToEmit = {
                    _id: newMessage._id,
                    text: newMessage.text,
                    createdAt: newMessage.createdAt,
                    household: householdId,
                    sender: {
                        _id: sender._id,
                        name: sender.name,
                        avatar: sender.avatar,
                        avatarColor: sender.avatarColor,
                    },
                    img: newMessage.img,
                    resourceType: newMessage.resourceType,
                    resourceId: newMessage.resourceId,
                };

                // Emit the message to all clients in the room
                io.to(`household_${householdId}`).emit(
                    "receiveMessage",
                    messageToEmit
                );

                // Send notifications to mentioned users
                if (
                    messageData.mentionedUsers &&
                    messageData.mentionedUsers.length > 0
                ) {
                    messageData.mentionedUsers.forEach(async (userId) => {
                        const notification = new Notification({
                            user: userId,
                            message: `${sender.name} Ви спомена в съобщение.`,
                            household: householdId,
                        });

                        const savedNotification = await notification.save();

                        // Send notification to the user if they have an active connection
                        sendNotificationToUser(userId, savedNotification);
                    });
                }
            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", "Failed to send message");
            }
        });

        socket.on("disconnect", () => {
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
