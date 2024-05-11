const express = require('express');

const expressConfig = require('./config/expressConfig');
const householdController = require('./controllers/householdController');

const app = express();

const PORT = 5000;

expressConfig(app);

app.use('/domakinstva', householdController);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));