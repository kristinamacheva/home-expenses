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

const verify = {
    // Verify user existence by ID
    user: async (userId) => {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    },

    // Verify invitation existence by ID
    invitation: async (invitationId) => {
        const invitation = await HouseholdInvitation.findById(invitationId);
        if (!invitation) {
            throw new Error('Invitation not found');
        }
        return invitation;
    },

    // Verify household existence by ID
    household: async (householdId) => {
        const household = await Household.findById(householdId);
        if (!household) {
            throw new Error('Household not found');
        }
        return household;
    }
};

exports.accept = async (userId, invitationId) => {
    try {
        // Verify user existence
        const user = await verify.user(userId);

        // Verify invitation existence
        const invitation = await verify.invitation(invitationId);

        // Verify that the invitation is for the current user
        if (invitation.user.toString() !== userId) {
            throw new Error('Unauthorized: User does not match invitation');
        }

        // Retrieve household information
        const household = await verify.household(invitation.household);

        const role = invitation.role;

        // Add user to the household members
        household.members.push({
            user: user._id,
            role: role
        });

        // Update admins array if the user's role is "Админ"
        if (role === 'Админ') {
            household.admins.push(user._id);
        }

        // Add to balance with default values if the user's role is not "Дете"
        if (role !== 'Дете') {
            household.balance.push({
                user: user._id,
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
        // Verify user existence
        const user = await verify.user(userId);

        // Verify invitation existence
        const invitation = await verify.invitation(invitationId);

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


