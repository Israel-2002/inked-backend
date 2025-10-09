const express = require("express");
const { config } = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const cookieParser = require("cookie-parser");

config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(authRoutes);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(PORT);
    })
    .catch((err) => console.log(err));
