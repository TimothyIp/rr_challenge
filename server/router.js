const AuthenticationController = require('./controllers/authentication'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport'),
      ChatController = require('./controllers/chat'),
      UserController = require('./controllers/user');

// Middleware for login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router(),
        userRoutes = express.Router();

        // Auth Routes
        apiRoutes.use('/auth', authRoutes);

        // Registration Route
        authRoutes.post('/register', AuthenticationController.register);

        authRoutes.post('/login', requireLogin, AuthenticationController.login);

        authRoutes.post('/guest', AuthenticationController.guestSignup);

        // Chat Routes
        apiRoutes.use('/chat', chatRoutes);

        // View messages from users
        chatRoutes.get('/', requireAuth, ChatController.getConversations);

        // Gets individual conversations
      //   chatRoutes.get('/:conversationId', requireAuth, ChatController.getConversation);

        // Gets Private conversations
        chatRoutes.get('/privatemessages/:recipientId', requireAuth, ChatController.getPrivateMessages);
        
        // Start new conversation
        chatRoutes.post('/new', requireAuth, ChatController.newConversation);
        
        chatRoutes.post('/leave', requireAuth, ChatController.leaveConversation);

        // Reply to conversations
        chatRoutes.post('/reply', requireAuth, ChatController.sendReply);
        
        // View Chat Channel messages
        chatRoutes.get('/channel/:channelName', ChatController.getChannelConversations);

        // Post to Channel
        chatRoutes.post('/postchannel/:channelName', requireAuth, ChatController.postToChannel);

        // User Routes
        apiRoutes.use('/user', userRoutes);

        // Gets user's joined channels
        userRoutes.get('/getchannels', requireAuth, UserController.getChannels);

        // Add to user's channels
        userRoutes.post('/addchannel', requireAuth, UserController.addChannel);

        // Remove from user's channels
        userRoutes.post('/removechannel', requireAuth, UserController.removeChannel)

        // Set URL for API groups
        app.use('/api', apiRoutes);

}