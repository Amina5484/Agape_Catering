import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import ROLES from '../config/roles.js';

const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+251|0)?9\d{8}$/; // Supports Ethiopian phone numbers in formats like +251943317021 or 0943317021
  return phoneRegex.test(phone);
};

// const registerUser = async (req, res, role) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     console.log(req.body); // Debugging log

//     if (!name || !email || !phone || !password) {
//       return res.status(400).json({ message: 'Please fill all fields' });
//     }

//     if (!isValidPhoneNumber(phone)) {
//       return res.status(400).json({ message: 'Invalid phone number format' });
//     }

//     // Check if the email already exists
//     let existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email is already registered' });
//     }

//     // Check if the phone number already exists
//     let existingPhone = await User.findOne({ phone });
//     if (existingPhone) {
//       return res
//         .status(400)
//         .json({ message: 'Phone number is already registered' });
//     }

//     // Create a new user
//     const user = new User({ name, email, phone, password, role });
//     await user.save();

//     res.status(201).json({ message: `${role} registered successfully` });
//   } catch (error) {
//     console.error('Error during registration:', error); // Log error for debugging

//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ message: error.message });
//     } else if (error.code === 11000) {
//       return res.status(400).json({ message: 'Duplicate entry detected' });
//     }

//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto'; // for random password
import welcomeEmailHTML from '../email_templates/welcomeEmail.js'; // for email template

const generateRandomPassword = () => {
  return crypto.randomBytes(6).toString('base64'); // Generates a short secure password
};

const registerUser = async (req, res, role) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || (role === ROLES.CUSTOMER && !password)) {
      return res
        .status(400)
        .json({ message: 'Please fill all required fields' });
    }

    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    let existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ message: 'Phone number is already registered' });
    }

    // Generate password for non-customer
    let userPassword = password;
    if (role !== ROLES.CUSTOMER) {
      userPassword = generateRandomPassword();

      try {
        await sendEmail({
          to: email,
          subject: 'Your Account Credentials',
          html: welcomeEmailHTML(name, email, userPassword, role),
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue with registration even if email fails
        // The password will be returned in the response
      }
    }

    const user = new User({ name, email, phone, password: userPassword, role });
    await user.save();

    // If email failed to send, include the password in the response
    const response = {
      message: `${role} registered successfully.`,
      ...(role !== ROLES.CUSTOMER && { password: userPassword }),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    } else if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate entry detected' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Specific role registration functions
export const registerCustomer = (req, res) =>
  registerUser(req, res, ROLES.CUSTOMER);
export const registerCateringManager = (req, res) =>
  registerUser(req, res, ROLES.CATERING_MANAGER);
export const registerExecutiveChef = (req, res) =>
  registerUser(req, res, ROLES.EXECUTIVE_CHEF);
export const registerSystemAdmin = (req, res) =>
  registerUser(req, res, ROLES.SYSTEM_ADMIN);

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    console.log('Request body:', { email, password: '***' });

    // Check if email and password are provided
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    console.log(
      'User found:',
      user
        ? {
            id: user._id,
            email: user.email,
            role: user.role,
          }
        : 'No user found'
    );

    if (!user) {
      console.log('User not found for email:', email);
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.matchPassword(password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('JWT token generated successfully');

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
