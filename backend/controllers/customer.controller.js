import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import genToken from "../utils/genToken.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const registerCustomer = async (req, res) => {
    try {
        let { fullName, email, password, phone } = req.body;

        fullName = fullName?.trim();
        email = email?.trim().toLowerCase();
        phone = phone?.trim();

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const emailExists = await Customer.findOne({ email });

        if (emailExists) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        const token = genToken(newCustomer._id);

        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        let { email, password } = req.body;

        email = email?.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const correctPassword = await bcrypt.compare(
            password,
            customer.password
        );

        if (!correctPassword) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = genToken(customer._id);

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Login successful",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const getMyProfile = (req, res) => {
    if (!req.user) {
        return res.status(404).json({ message: "User not found" });
    }
    const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete userObj.password;
    res.status(200).json(userObj);
};

export const logoutCustomer = (req, res) => {
    res.clearCookie("token", cookieOptions);

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};