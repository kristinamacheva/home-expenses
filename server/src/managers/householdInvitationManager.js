const Household = require("../models/Household");
const HouseholdInvitation = require("../models/HouseholdInvitation");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");

// TODO: save info in the document without using populate?
exports.getAll = async (userId) => {
    const result = await HouseholdInvitation.find({ user: userId })
        .populate("household", "name")
        .populate("creator", "email")
        .lean();

    return result;
};

exports.accept = async (userId, invitationId) => {
    const invitation = await HouseholdInvitation.findById(invitationId);

    // Verify that the invitation is for the current user
    if (invitation.user.toString() !== userId) {
        throw new AppError(
            "Неоторизиран: Потребителят не съответства на поканата",
            401
        );
    }

    const household = await Household.findById(invitation.household);

    if (!household) {
        throw new AppError("Домакинството не е намерено", 404);
    }

    const role = invitation.role;

    // Add user to the household members
    household.members.push({
        user: userId,
        role: role,
    });

    // Update admins array if the user's role is "Админ"
    if (role === "Админ") {
        household.admins.push(userId);
    }

    // Add to balance with default values if the user's role is not "Дете"
    if (role !== "Дете") {
        household.balance.push({
            user: userId,
            sum: 0,
            type: "+",
        });
    }

    // TODO: transaction
    // Save the updated household
    await household.save();

    // Add householdId to the user's households array
    await User.findByIdAndUpdate(userId, {
        $addToSet: { households: household._id },
    });

    // Delete the invitation
    await HouseholdInvitation.deleteOne({ _id: invitationId });

    return household._id; // Return household ID after successful acceptance and deletion
};

exports.reject = async (userId, invitationId) => {
    const invitation = await HouseholdInvitation.findById(invitationId);

    // Verify that the invitation is for the current user
    if (invitation.user.toString() !== userId) {
        throw new AppError(
            "Неоторизиран: Потребителят не съответства на поканата",
            401
        );
    }

    // Delete the invitation
    const deletionResult = await HouseholdInvitation.deleteOne({
        _id: invitationId,
    });

    if (deletionResult.deletedCount === 0) {
        throw new AppError("Неуспешно изтриване на поканата", 500);
    }
};
