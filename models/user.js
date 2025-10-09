const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
    {
        personal_info: {
            username: {
                type: String,
                required: true,
                unique: true,
            },

            fullname: {
                type: String,
                required: true,
            },

            email: {
                type: String,
                required: true,
                unique: true,
            },

            password: {
                type: String,
                required: true,
            },

            bio: {
                type: String,
                default: "",
                maxlength: 250,
            },
        },

        refresh_token: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", schema);
