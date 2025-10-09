const { customAlphabet } = require("nanoid");
const User = require("../models/user");

const generateUsername = async () => {
    const nanoid = customAlphabet(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        5
    );

    let username = `user-${nanoid()}`;

    let usernameExists = await User.exists({
        "personal_info.username": username,
    });

    while (usernameExists) {
        username = `user-${nanoid()}`;

        usernameExists = await User.exists({
            "personal_info.username": username,
        });
    }

    return username;
};

module.exports = {
    generateUsername,
};
