// List of allowed origins for CORS. If you are developing on a new port or IP address,
// be sure to add the origin here to avoid CORS issues.

const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://192.168.56.1:4173",
    // Add new origins here as needed
];

module.exports = ALLOWED_ORIGINS;
