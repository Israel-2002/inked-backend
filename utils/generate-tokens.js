const { sanitizeUser } = require("./sanitize-user");
const jwt = require("jsonwebtoken");

exports.generateTokens = async (user, res) => {
    const sanitizedUser = sanitizeUser(user);

    const accessToken = jwt.sign(
        sanitizedUser,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "30m",
        }
    );

    const refreshToken = jwt.sign(
        sanitizedUser,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );

    user.refresh_token = refreshToken;
    await user.save();

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
        accessToken,
        refreshToken,
    };
};
