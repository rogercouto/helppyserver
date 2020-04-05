const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { errors } = require('celebrate');

const routes = require('./routes');

const app = express();

require('dotenv').config();

app.use(fileUpload({createParentPath: true}));
app.use(express.static('uploads'));
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errors());

module.exports = app;