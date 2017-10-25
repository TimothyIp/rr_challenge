const AuthenticationController = require('./controllers/authentication'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport');

// Middleware for login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  const apiRoutes = express.Router(),
        authRoutes = express.Router()

        // Auth Routes
        apiRoutes.use('/auth', authRoutes);

        // Registration Route
        authRoutes.post('/register', AuthenticationController.register);

        authRoutes.post('/login', requireLogin, AuthenticationController.login);

        // Set URL for API groups
        app.use('/api', apiRoutes);

}