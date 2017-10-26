const AuthenticationController = require('./controllers/authentication'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport'),
      ChatController = require('./controllers/chat');

// Middleware for login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router();

        // Auth Routes
        apiRoutes.use('/auth', authRoutes);

        // Registration Route
        authRoutes.post('/register', AuthenticationController.register);

        authRoutes.post('/login', requireLogin, AuthenticationController.login);

        // Chat Routes
        apiRoutes.use('/chat', chatRoutes)

        // View messages from users
        chatRoutes.get('/', requireAuth, ChatController.getConversations);

        // Gets individual conversations
        chatRoutes.get('/:conversationId', requireAuth, ChatController.getConversation);

        // Replys to conversations
        chatRoutes.post('/:conversationId', requireAuth, ChatController.sendReply);

        // Start new conversation
        chatRoutes.post('/new/:recipient', requireAuth, ChatController.newConversation);

        // Set URL for API groups
        app.use('/api', apiRoutes);

}