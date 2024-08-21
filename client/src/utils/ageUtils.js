import moment from "moment";

// Function to check if the child is younger than 14 years old
export const isChildUnder14 = (birthdate) => {
    if (!birthdate) return false;
    const currentMoment = moment(); // Get current date
    const birthMoment = moment(birthdate); // Convert birthdate to moment object
    const age = currentMoment.diff(birthMoment, "years"); // Calculate age in years
    return age < 14;
};

// Function to check if the child is 18 years old or older
export const isChild18OrOver = (birthdate) => {
    if (!birthdate) return false;
    const currentMoment = moment(); // Get current date
    const birthMoment = moment(birthdate); // Convert birthdate to moment object
    const age = currentMoment.diff(birthMoment, "years"); // Calculate age in years
    return age >= 18;
};