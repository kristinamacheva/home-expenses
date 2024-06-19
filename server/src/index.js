require('dotenv').config();
const express = require('express');
const dbConnect = require('./config/dbConfig');

const expressConfig = require('./config/expressConfig');
const routes = require('./routes');

const app = express();

const PORT = 5000;

expressConfig(app);

dbConnect()
    .then(() => console.log('DB Connected successfully'))
    .catch(err => console.log('DB error: ', err.message));

app.use(routes);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));