/**
 * Validation utilities for form inputs
 */

/**
 * Validates that a name contains only alphabetical characters and is at least 3 characters long
 * @param {string} name - The name to validate
 * @returns {boolean} - Whether the name is valid
 */
export const isValidName = (name) => {
    const nameRegex = /^[A-Za-z]{3,}$/;
    return nameRegex.test(name);
};

/**
 * Validates that a password is strong:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one digit
 * - Contains at least one special character
 * 
 * @param {string} password - The password to validate
 * @returns {boolean} - Whether the password is valid
 */
export const isStrongPassword = (password) => {
    // Check length
    if (password.length < 8) return false;

    // Check if contains at least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;

    // Check if contains at least one lowercase letter
    if (!/[a-z]/.test(password)) return false;

    // Check if contains at least one digit
    if (!/[0-9]/.test(password)) return false;

    // Check if contains at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

    return true;
};

/**
 * Validates that a phone number is in the correct Ethiopian format:
 * - Starts with +2519 or +2517
 * - Exactly 12 characters long
 * 
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidEthiopianPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^(\+2519|\+2517)\d{8}$/;
    return phoneRegex.test(phoneNumber);
};

/**
 * Gets validation error messages for form fields
 * 
 * @param {string} field - The field name
 * @param {string} value - The field value
 * @returns {string|null} - Error message or null if valid
 */
export const getValidationError = (field, value) => {
    switch (field) {
        case 'name':
            return !isValidName(value)
                ? 'Name must contain at least 3 alphabetical characters (no numbers or special characters)'
                : null;

        case 'password':
            return !isStrongPassword(value)
                ? 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
                : null;

        case 'phoneNumber':
            return !isValidEthiopianPhoneNumber(value)
                ? 'Phone number must be in format +2519XXXXXXXX or +2517XXXXXXXX (12 digits total)'
                : null;

        default:
            return null;
    }
}; 