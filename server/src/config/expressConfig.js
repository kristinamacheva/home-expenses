const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

function expressConfig(app) {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    // app.use(cors());
    app.use(cors({
        origin: 'http://localhost:5173', 
        credentials: true
    }));
    app.use(cookieParser());
}

module.exports = expressConfig;