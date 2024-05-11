const express = require('express');

const expressConfig = require('./config/expressConfig');

const app = express();

const PORT = 5000;

expressConfig(app);

app.get('/', (req, res) => {
    res.send('Hello from express'); 
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));