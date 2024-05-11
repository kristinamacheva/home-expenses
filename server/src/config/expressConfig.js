const express = require('express');

function expressConfig(app) {
    app.use(express.urlencoded({ extended: false }));
}

module.exports = expressConfig;