const Household = require("../models/Household");
const HouseholdInvitation = require("../models/HouseholdInvitation");
const User = require("../models/User");

// TODO: save info in the document without using populate?
exports.getAll = async (userId) => {
    const result = await HouseholdInvitation.find({ "user": userId })
    .populate("household", "name")
    .populate("creator", "email");

    return result;
};

exports.accept = async (userId, invitationId) => {
    try {
        const invitation = await HouseholdInvitation.findById(invitationId);

        // Verify that the invitation is for the current user
        if (invitation.user.toString() !== userId) {
            throw new Error('Unauthorized: User does not match invitation');
        }

        const household = await Household.findById(invitation.household);

        if (!household) {
            throw new Error('Household not found');
        }

        const role = invitation.role;

        // Add user to the household members
        household.members.push({
            user: userId,
            role: role
        });

        // Update admins array if the user's role is "Админ"
        if (role === 'Админ') {
            household.admins.push(userId);
        }

        // Add to balance with default values if the user's role is not "Дете"
        if (role !== 'Дете') {
            household.balance.push({
                user: userId,
                sum: 0,   
                type: "+", 
            });
        }

        // Save the updated household
        await household.save();

        // Delete the invitation
        await HouseholdInvitation.deleteOne({ _id: invitationId });

        return household._id; // Return household ID after successful acceptance and deletion
    } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error; // Re-throw the error for centralized error handling
    }
};

exports.reject = async (userId, invitationId) => {
    try {
        const invitation = await HouseholdInvitation.findById(invitationId);

        // Verify that the invitation is for the current user
        if (invitation.user.toString() !== userId) {
            throw new Error('Unauthorized: User does not match invitation');
        }

        // Delete the invitation
        const deletionResult = await HouseholdInvitation.deleteOne({ _id: invitationId });

        if (deletionResult.deletedCount === 0) {
            throw new Error('Failed to delete invitation');
        }

        // Return a success message
        return { message: 'Invitation rejected and deleted successfully' };
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        throw error; // Re-throw the error for centralized error handling
    }
};


