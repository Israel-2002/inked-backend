const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { generateUsername } = require("../utils/generate-username");
const { generateTokens } = require("../utils/generate-tokens");
const jwt = require("jsonwebtoken");
const { sanitizeUser } = require("../utils/sanitize-user");

exports.signup = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const result = validationResult(req);

        if (!result.isEmpty()) {
            const error = result.array()[0].msg;
            return res.status(400).json({ error });
        }

        const userExists = await User.exists({
            "personal_info.email": email,
        });

        if (userExists) {
            return res.status(409).json({
                message: "This email is associated with another user",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const username = await generateUsername();

        const user = await User.create({
            personal_info: {
                username,
                fullname,
                email,
                password: hashedPassword,
            },
        });

        const { accessToken } = await generateTokens(user, res);

        res.status(201).json({
            message: "User created successfully",
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res.status(401).json({
                message: "Email provided not associated with any user",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.personal_info.password
        );

        if (!passwordMatches) {
            return res.status(401).json({ message: "Password is incorrect" });
        }

        const { accessToken } = await generateTokens(user, res);

        res.status(200).json({
            message: "Logged in successfully",
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refresh = async (req, res) => {
    try {
        const cookies = req.cookies;

        if (!cookies?.jwt) {
            return res.status(401).json({
                message: "No refresh token found. Please sign in again",
            });
        }

        const decoded = jwt.verify(
            cookies.jwt,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findOne({ refresh_token: cookies.jwt });

        if (decoded.personal_info.username !== user.personal_info.username) {
            return res.status(403).json({
                message: "Refresh token is invalid or does not match the user",
            });
        }

        const sanitizedUser = sanitizeUser(user);

        const accessToken = jwt.sign(
            sanitizedUser,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        res.status(200).json({
            message: "New access token generated",
            accessToken,
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid or expired jwt" });
        }

        res.status(500).json({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    try {
        const cookies = req.cookies;

        if (!cookies?.jwt) {
            return res.sendStatus(204);
        }

        const refreshToken = cookies.jwt;

        const user = await User.findOne({ refresh_token: refreshToken });

        if (!user) {
            res.clearCookie("jwt", cookieOptions);

            return res
                .status(403)
                .json({ message: "JWT is invalid or does not match the user" });
        }

        await User.updateOne(
            { refresh_token: refreshToken },
            { refresh_token: "" }
        );

        res.clearCookie("jwt", cookieOptions);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
