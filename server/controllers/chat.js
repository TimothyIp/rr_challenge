"use strict"

const Conversation = require('../models/conversation'),
      Message = require('../models/message'),
      User = require('../models/user'),
      Channel = require('../models/channel');

// Creates a conversation link between user and recipient for private messaging
exports.newConversation = function(req, res, next) {
  const recipient = req.body.startDmInput;
  const userId = req.user._id

  if (!recipient) {
    res.status(422).send({
      error: "Enter a valid recipient."
    });
    return next();
  }

  // Looks for a username with recipient name then creates a new Conversation schema with both user and 
  // recipient in the participants array in the conversation model.
  User.findOne({ username: recipient }, function(err, foundRecipient) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    if (!foundRecipient) {
      return res.status(422).send({
        error: 'Could not find recipient.'
      });
    }

    // Adds both user id and recipient id to a participants array
    const conversation = new Conversation({
      participants: [ req.user._id , foundRecipient._id ]
    })

    conversation.save(function(err, newConversation) {
      if (err) {
        res.send({
          error: err
        });
        return next(err);
      }

      res.status(200).json({
        message: `Started conversation with ${foundRecipient.username}`,
        recipientId: foundRecipient._id,
        recipient: foundRecipient.username,
      })

    });

  });
}

// Lets users remove the current conversation in their user panel.
exports.leaveConversation = function(req, res, next) {
  const conversationToLeave = req.body.conversationId;
  
  // Is given the recipient id and then looks in participants array in conversations
  Conversation.findOneAndRemove({ participants: conversationToLeave }, function(err, foundConversation){
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    res.status(200).json({
      message: 'Left from the Conversation.'
    });
    return next();
  });
}

// Takes a channel name and message, then saves a new message with the id from the saved model of channel.
exports.postToChannel = function(req, res, next) {
  const channelName = req.params.channelName;
  const composedMessage = req.body.composedMessage;

  if (!channelName) {
    res.status(422).json({
      error: 'Enter a valid channel name.'
    });
    return next();
  }

  if (!composedMessage) {
    res.status(422).json({
      error: 'Please enter a message.'
    });
  }

  const channel = new Channel({
    channelName
  });

  channel.save(function(err, channelPost) {
    if (err) {
      res.send({ error: err });
      return next(err);
    }

  // Tells mongodb which schema to reference, a guest or user collection to display the correct author for messages.
   const checkAuthor = () => {
      if (req.user.username) {
        let author = {
          kind: 'User',
          item: req.user._id
        }
        return author;
      } else {
        let guestAuthor = {
          kind: 'Guest',
          item: req.user._id
        }
        return guestAuthor;
      }
    };

    const post = new Message({
      conversationId: channelPost._id,
      body: composedMessage,
      author: [ checkAuthor() ],
      channelName,
      guestPost: req.user.guestName || ""
    });

    post.save(function(err, newPost) {
      if (err) { 
        res.send({ error: err })
        return next(err);
      }

      res.status(200).json({
        message: `Posted to channel ${channelName}`,
        conversationId: newPost._id,
        postedMessage: composedMessage
      })
    });
  })
}

// Looks for channel conversations by looking up all the messages 
// that has the requested channel name when the message was saved.
exports.getChannelConversations = function(req, res, next) {
  const channelName = req.params.channelName;

  Message.find({ channelName })
    .select('createdAt body author guestPost')
    .sort('-createdAt')
    .populate('author.item')
    .exec((err, messages) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      // Reversed the array so you get most recent messages on the button
      const getRecent = messages.reverse();

      return res.status(200).json({
        channelMessages: getRecent
      })
    })
}

// Gets a over log of active conversations the user is in.
// Looks up the all the places where the participants is the user in conversation model
// Returns all the different conversations where the participant is the user.
exports.getConversations = function (req, res, next) {
  const username = req.user.username;

  // Show recent message from each conversation
  Conversation.find({ participants: req.user._id })
    .sort('_id')
    .populate({
      path: 'participants',
      select: 'username'
    })
    .exec((err, conversations) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      if (conversations.length === 0) {
        return res.status(200).json({
          message: 'No conversations yet'
        })
      }

      const conversationList = [];
      conversations.forEach((conversation) => {
        const conversationWith = conversation.participants.filter(item => {
          return item.username !== username
        });

        conversationList.push(conversationWith[0]);
        if (conversationList.length === conversations.length) {
          return res.status(200).json({
            conversationsWith: conversationList
          })
        }   
      });
    });
};

// Takes a message, recipient id, and user id
// Looks at all conversations where the recipient id and user id match in the participants array then gets that id
// Using the conversation id, a reply is made with a new message with the same conversation Id
exports.sendReply = function(req, res, next) {
  const privateMessage = req.body.privateMessageInput;
  const recipientId = req.body.recipientId;
  const userId = req.user._id;

  Conversation.findOne({ participants: {$all: [ userId, recipientId]} }, function(err, foundConversation) {
    if (err) {
      res.send({
        errror: err
      });
      return next(err);
    }

    if (!foundConversation) {
      return res.status(200).json({
        message: 'Could not find conversation'
      })
    }

    const reply = new Message({
      conversationId: foundConversation._id,
      body: privateMessage,
      author: {
        kind: 'User',
        item: req.user._id
      }
    })

   reply.save(function(err, sentReply) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    res.status(200).json({
      message: 'Reply sent.'
    });
    return next();
    });
  });
}

// Gets a user id and recipient Id
// Looks at all the conversations where the participants are the user id and recipient - this returns the conversation id if found
// Using that conversation id, it looks through the messages for that conversation Id and returns all the messages for that conersation
exports.getPrivateMessages = function(req, res, next) {
  const userId = req.user._id;
  const recipientId = req.params.recipientId;

  Conversation.findOne({ participants: {$all: [ userId, recipientId]}}, function(err, foundConversation) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    if (!foundConversation) {
      return res.status(200).json({
        message: 'Could not find conversation'
      })
    }

    Message.find({ conversationId: foundConversation._id })
    .select('createdAt body author')
    .sort('-createdAt')
    .populate('author.item')
    .exec(function(err, message) {
      if (err) {
        res.send({
          error: err
        });
        return next();
      }

      // Reverse to show most recent messages
      const sortedMessage = message.reverse();

      res.status(200).json({
        conversation: sortedMessage,
        conversationId: foundConversation._id
      });
    });
  });
}