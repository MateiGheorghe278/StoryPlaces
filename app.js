var http = require('http');
var fs = require('fs');

var express = require('express');
var app = express();
const controller1 = require('./controllers/ServerController');

app.set('view engine', 'ejs');
app.use(express.static('./assets'));

controller1(app);
