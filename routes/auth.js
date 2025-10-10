const express = require("express");
const { signup, login, refresh, logout } = require("../controllers/auth");
const { body } = require("express-validator");

const router = express.Router();

router.post(
    "/signup",
    [
        body("fullname")
            .trim()
            .notEmpty()
            .withMessage("Fullname is required")
            .isLength({ min: 3 })
            .withMessage("Fullname must not be less than 3 characters"),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Value is not a valid email")
            .normalizeEmail(),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .custom((value) => {
                const passwordRegex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

                const isValid = passwordRegex.test(value);

                if (!isValid) {
                    throw new Error(
                        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
                    );
                }

                return true;
            }),

        body("confirm_password")
            .trim()
            .notEmpty()
            .withMessage("Confirm password is required")
            .custom((value, { req }) => {
                const matches = value === req.body.password;

                if (!matches) {
                    throw new Error("Passwords do not match");
                }

                return true;
            }),
    ],
    signup
);

router.post(
    "/login",
    [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Value is not a valid email")
            .normalizeEmail(),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .custom((value) => {
                const passwordRegex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

                const isValid = passwordRegex.test(value);

                if (!isValid) {
                    throw new Error(
                        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
                    );
                }

                return true;
            }),
    ],
    login
);

router.get("/refresh-token", refresh)
router.post("/logout", logout)

module.exports = router;
