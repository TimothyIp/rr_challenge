const express = require('express'),
      app = express();
      bodyParser = require('body-parser'),
      logger = require('morgan'),
      mongoose = require('mongoose'),
      config = require('./config/main'),
      router = require('./router'),
      socketEvents = require('./socketEvents');

// Connect to the database
mongoose.connect(config.database);

// Start the server
const server = app.listen(config.port);
console.log('The server is running on port ' + config.port + '.');

const io = require('socket.io').listen(server);
socketEvents(io);

// Middleware for Express requests
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Enables CORS from client-side
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

router(app);