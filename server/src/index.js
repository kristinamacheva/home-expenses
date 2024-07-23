require("dotenv").config();
const express = require("express");
const dbConnect = require("./config/dbConfig");
const expressConfig = require("./config/expressConfig");
const routes = require("./routes");
const errorHandler = require("./middlewares/ErrorHandlerMiddleware");
const cloudinary = require("cloudinary").v2;
const insertCategories = require('./utils/categories/seedPredefinedCategories'); 

// make an express app
const app = express();
const PORT = 5000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

expressConfig(app);

// Connect to the database and seed categories
dbConnect()
    .then(async () => {
        console.log("DB Connected successfully");

        // Insert predefined categories
        await insertCategories();

        // Set up routes
        app.use(routes);

        // Error handling middleware (Last middleware to use)
        app.use(errorHandler);

        // Retrieve server and io instances from app settings
        const server = app.get("server");

        // Start the server
        server.listen(PORT, () =>
            console.log(`Server is running on port ${PORT}...`)
        );
    })
    .catch((err) => {
        console.log("DB error: ", err.message);
    });
