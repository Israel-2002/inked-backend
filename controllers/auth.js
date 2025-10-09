const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { generateUsername } = require("../utils/generate-username");
const { generateTokens } = require("../utils/generate-tokens");

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
            return res
                .status(409)
                .json({ error: "This email is associated with another user" });
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
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res
                .status(401)
                .json({ error: "Email provided not associated with any user" });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.personal_info.password
        );

        if (!passwordMatches) {
            return res.status(401).json({ error: "Password is incorrect" });
        }

        const { accessToken } = await generateTokens(user, res);

        res.status(200).json({
            message: "Logged in successfully",
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
