'use strict';
const path = require("path");
const fs = require("fs");
const express = require('express');
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 1337;
const STATIC_DIR = path.resolve(__dirname, "web");





var app = express();
var createServer = require('http').createServer;

app.use(express.static(STATIC_DIR));

app.listen(PORT, () => console.log("Example app listening on http://localhost:" + PORT + ""))