const Reminder = require("../models/Reminder");
const Household = require("../models/Household");
const Payment = require("../models/Payment");
const PaidExpense = require("../models/PaidExpense");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { sendNotificationToUser } = require("../config/socket");
const { AppError } = require("../utils/AppError");

exports.getAll = async (userId) => {
    // Fetch the last 30 reminders for the user
    const reminders = await Reminder.find({
        receiver: new mongoose.Types.ObjectId(userId),
    })
        .sort({ createdAt: -1 }) // sort by latest first
        .limit(30);

    // If there are more than 30 reminders, delete the older ones
    if (reminders.length === 30) {
        const lastReminderDate = reminders[29].createdAt;

        await Reminder.deleteMany({
            receiver: new mongoose.Types.ObjectId(userId),
            createdAt: { $lt: lastReminderDate },
        });
    }

    return reminders;
};

exports.create = async (reminderData) => {
    const { household, sender, receiver, message, resourceType, resourceId } =
        reminderData;

    const reminderHousehold = await Household.findById(household);

    if (!reminderHousehold) {
        throw new AppError(`Домакинството не съществува.`, 403);
    }

    // Check if both sender and receiver are members of the household
    const senderExists = reminderHousehold.members.some((member) =>
        member.user.equals(sender)
    );
    const receiverExists = reminderHousehold.members.some((member) =>
        member.user.equals(receiver)
    );

    if (!senderExists || !receiverExists) {
        throw new AppError(
            "Създателят/Получателят не е член на домакинството",
            403
        );
    }

    // Check if the household is archived
    if (reminderHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    // Create and save the new category
    const newReminder = new Reminder({
        household,
        sender,
        receiver,
        message,
    });

    // Check if the resource exists and belongs to the household
    if (resourceType && resourceId) {
        const validResourceTypes = ["paidExpense", "payment"];
        if (validResourceTypes.includes(resourceType)) {
            let resourceModel;
            switch (resourceType) {
                case "paidExpense":
                    resourceModel = PaidExpense;
                    resourceType = "PaidExpense";
                    break;
                case "payment":
                    resourceModel = Payment;
                    resourceType = "Payment";
                    break;
                default:
                    throw new Error("Невалиден тип на ресурс");
            }

            const resource = await resourceModel.findById(resourceId);

            if (!resource || !resource.household.equals(householdId)) {
                throw new Error(
                    "Ресурсът не е намерен или не принадлежи към домакинството"
                );
            }

            newReminder.resourceType = resourceType;
            newReminder.resourceId = resourceId;
        } else {
            throw new AppError(`Невалиден ресурс`, 403);
        }
    }

    await newReminder.save();

    // Create notification for the receiver
    const notification = new Notification({
        user: receiver,
        message: `Получихте напомняне за домакинство ${reminderHousehold.name}.`,
        household,
        resourceType: "Reminder",
        resourceId: newReminder._id,
    });

    const savedNotification = await notification.save();

    // Send notification to the user if they have an active connection
    sendNotificationToUser(receiver, savedNotification);

    return newReminder;
};

exports.delete = async (reminderId) => {
    await Reminder.findByIdAndDelete(reminderId);
};
