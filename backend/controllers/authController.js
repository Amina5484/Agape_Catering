
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import ROLES from '../config/roles.js';

const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Supports E.164 international format
    return phoneRegex.test(phone);
};

const registerUser = async (req, res, role) => {
    try {
        const { name, email, phone, password } = req.body;

        console.log(req.body); // Debugging log

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        if (!isValidPhoneNumber(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        // Check if the email already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // Check if the phone number already exists
        let existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ message: "Phone number is already registered" });
        }

        // Create a new user
        const user = new User({ name, email, phone, password, role });
        await user.save();

        res.status(201).json({ message: `${role} registered successfully` });
    } catch (error) {
        console.error("Error during registration:", error); // Log error for debugging

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        } else if (error.code === 11000) {
            return res.status(400).json({ message: "Duplicate entry detected" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
};


// Specific role registration functions
export const registerCustomer = (req, res) => registerUser(req, res, ROLES.CUSTOMER);
export const registerCateringManager = (req, res) => registerUser(req, res, ROLES.CATERING_MANAGER);
export const registerExecutiveChef = (req, res) => registerUser(req, res, ROLES.EXECUTIVE_CHEF);
export const registerSystemAdmin = (req, res) => registerUser(req, res, ROLES.SYSTEM_ADMIN);

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
