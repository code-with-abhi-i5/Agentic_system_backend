import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./auth.model.js";
import {
    generateAccessToken,
    generateAuthPayload,
    generateRefreshToken
} from "./auth.utils.js";
import crypto from "crypto";
import Verification from "./verification.model.js";
import { sendOtpEmail } from "./mail.js";
import { fileStorage } from "../../utils/fileStorage.js";

export const registerUser = async ({
    name,
    email,
    password,
    otp,
}) => {
    if (!email) {
        throw new Error("Email is required");
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists in DB or disk
    if (mongoose.connection.readyState === 1) {
        try {
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
                throw new Error("User already exists with this email");
            }
        } catch (e) {
            if (e.message.includes("already exists")) throw e;
        }
    }
    const diskUser = fileStorage.findUserByEmail(cleanEmail);
    if (diskUser) {
        throw new Error("User already exists with this email");
    }

    let userName = name || cleanEmail.split("@")[0];
    let hashedPassword = "";

    // If OTP provided, verify OTP
    if (otp) {
        let verification = null;
        if (mongoose.connection.readyState === 1) {
            verification = await Verification.findOne({ email: cleanEmail });
        }
        if (!verification) {
            throw new Error("OTP expired or invalid");
        }
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        if (verification.otpHash !== otpHash) {
            throw new Error("Invalid OTP");
        }
        userName = verification.name || userName;
        hashedPassword = verification.passwordHash;
        await Verification.deleteOne({ _id: verification._id });
    } else {
        // Direct Registration
        if (!password || password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }
        hashedPassword = await bcrypt.hash(password, 10);
    }

    let user = null;
    if (mongoose.connection.readyState === 1) {
        try {
            user = await User.create({
                name: userName,
                email: cleanEmail,
                password: hashedPassword,
            });
            user = user.toObject ? user.toObject() : user;
        } catch (e) {
            console.warn("MongoDB User.create error, using disk storage:", e.message);
        }
    }

    if (!user) {
        user = {
            _id: `usr-${Date.now()}`,
            name: userName,
            email: cleanEmail,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };
    }

    // Persist to disk for permanent storage
    fileStorage.saveUser(user);

    return generateAuthPayload(user);
};

export const loginUser = async ({
    email,
    password,
}) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (mongoose.connection.readyState === 1) {
        try {
            user = await User.findOne({ email: cleanEmail });
        } catch (e) {
            console.warn("MongoDB login search error:", e.message);
        }
    }

    if (!user) {
        user = fileStorage.findUserByEmail(cleanEmail);
    }

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    return generateAuthPayload(user);
};
export const refreshAccessToken =
    async (refreshToken) => {

        if (!refreshToken) {
            throw new Error(
                "Refresh token required"
            );
        }

        let decoded;

        try {

            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

        }
        catch (error) {

            if (error.name === "TokenExpiredError") {
                throw new Error("Refresh token expired");
            }

            throw new Error("Invalid refresh token");

        }

        const user =
            await User.findById(
                decoded.userId
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        if (
            user.refreshToken !==
            refreshToken
        ) {
            throw new Error(
                "Invalid refresh token"
            );
        }

        const accessToken =
            generateAccessToken(user._id);

        const newRefreshToken =
            generateRefreshToken(user._id);

        user.refreshToken =
            newRefreshToken;

        await user.save();

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    };
export const logoutUser =
    async (userId) => {
        if (mongoose.connection.readyState === 1) {
            try {
                await User.findByIdAndUpdate(
                    userId,
                    {
                        refreshToken: null,
                    }
                );
            } catch (e) {}
        }
        return {
            message:
                "Logged out successfully",
        };
    };
export const getCurrentUser =
    async (userId) => {
        let user = null;
        if (mongoose.connection.readyState === 1) {
            try {
                user = await User.findById(userId)
                    .select("-password -refreshToken")
                    .lean();
            } catch (e) {}
        }
        if (!user) {
            user = fileStorage.findUserById(userId);
        }

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        return {
            id: user._id || user.id,
            name: user.name,
            email: user.email,
        };
    };
export const sendRegistrationOtp =
    async ({
        name,
        email,
        password,
    }) => {

        const existingUser =
            await User.findOne({
                email,
            });

        if (existingUser) {
            throw new Error(
                "User already exists"
            );
        }

        const existingVerification =
            await Verification.findOne({
                email: email.toLowerCase(),
            });

        if (existingVerification) {

            const diff =
                Date.now() -
                existingVerification.lastOtpSentAt.getTime();

            if (diff < 60_000) {

                const seconds =
                    Math.ceil(
                        (60_000 - diff) / 1000
                    );

                throw new Error(
                    `Please wait ${seconds}s before requesting another OTP`
                );
            }
        }

        const otp =
            Math.floor(
                100000 +
                Math.random() *
                900000
            ).toString();

        const otpHash =
            crypto
                .createHash("sha256")
                .update(otp)
                .digest("hex");

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );

        await Verification.findOneAndUpdate(
            {
                email: email.toLowerCase(),
            },
            {
                name,
                email: email.toLowerCase(),
                passwordHash,
                otpHash,
                expiresAt:
                    new Date(
                        Date.now() +
                        10 * 60 * 1000
                    ),
                lastOtpSentAt:
                    new Date(),
            },
            {
                upsert: true,
                new: true,
            }
        );

        await sendOtpEmail(
            email,
            otp
        );

        return {
            message:
                "OTP sent successfully",
        };
    };

