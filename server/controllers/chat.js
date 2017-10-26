"use strict"

const Conversation = require('../models/conversation'),
      Message = require('../models/message'),
      User = require('../models/user');

exports.newConversation = function(req, res, next) {

  if (!req.params.recipient) {
    res.status(422).send({
      error: "Choose a valid recipient for your message."
    });
    return next();
  }

  if (!req.body.composedMessage) {
    res.status(422).send({
      error: "Please enter a message."
    })
    return next();
  }

  const conversation = new Conversation({
    participants: [req.user._id, req.params.recipient],
  });

  conversation.save(function(err, newConversation) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    const message = new Message({
      conversationId: newConversation._id,
      body: req.body.composedMessage,
      author: req.user._id
    });

    message.save(function(err, newMessage) {
      if (err) {
        res.send({
          error: err
        });
        return next(err);
      }

      res.status(200).json({
        message: 'Started a conversation',
        conversationId: conversation._id
      });
      return next();
    });
  });
}

exports.postToChannel = function(req, res, next) {
  const channelName = req.params.channelName;
  const composedMessage = req.body.composedMessage;

  console.log("REQ USER----------", req.user)
  console.log("REQ BODY----------", req.body)
  console.log("REQ PARAMS--------", req.params)

  if (!channelName) {
    res.status(422).json({
      error: 'Enter a valid channel name.'
    });
    return next();
  }

  if (!composedMessage) {
    res.status(422).json({
      error: 'Please enter a message.'
    })
  }

  const conversation = new Conversation({
    participants: [req.user._id],
    channelName
  });

  conversation.save(function(err, postToChannel) {
    if (err) {
      res.send({ error: err });
      return next(err);
    }

    const post = new Message({
      conversationId: postToChannel._id,
      body: composedMessage,
      author: req.user._id
    });

    post.save(function(err, newPost) {
      if (err) { 
        res.send({ error: err })
        return next(err);
      }

      res.status(200).json({
        message: `Posted to channel ${channelName}`,
        conversationId: conversation._id,
        postedMessage: composedMessage
      })
    });

  });

}


exports.getConversations = function (req, res, next) {
  // Show recent message from each conversation
  Conversation.find({ participants: req.user._id })
    .select('_id')
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

      // show recent conversations
      const fullConversations = [];
      conversations.forEach((conversation) => {
        Message.find({ conversationId: conversation._id })
          .sort('-createdAt')
          .limit(1)
          .populate({
            path: 'author',
            select: 'username'
          })
          .exec((err, message) => {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            fullConversations.push(message);
            if (fullConversations.length === conversations.length) {
              return res.status(200).json({ conversations: fullConversations });
            }
          });
      });
    });
};

exports.getConversation = function(req, res, next) {
  Message.find({ conversationId: req.params.conversationId })
    .select('createdAt body author')
    .sort('-createdAt')
    .populate({
      path: 'author',
      select: 'username'
    })
    .exec(function(err, message) {
      if (err) {
        res.send({
          error: err
        });
        return next();
      }

      res.status(200).json({
        conversation: message
      });
    });
};

exports.sendReply = function(req, res, next) {
  const reply = new Message({
    conversationId: req.params.conversationId,
    body: req.body.composedMessage,
    author: req.user._id
  });

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
}

exports.deleteConversation = function(req, res, next) {
  Conversation.findOneAndRemove({
    $and : [{ '_id':req.params.conversationId }, { 'participants': req.user._id }]
  }, function(err, message) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    res.status(200).json({
      message: 'Removed Conversation.'
    });
    return next();
  })
}

exports.updateMessage = function(req, res, next) {
  Conversation.find({
    $and : [ { '_id':req.params.messageId }, {'author': req.user._id}]
  }, function(err, message) {
    if (err) {
      res.send({
        error: err
      });
      return next();
    }

    message.body = req.body.composedMessage;

    message.save(function(err, updateMessage) {
      if (err) {
        res.send({
          error: err
        });
        return next();
      }

      res.status(200).json({
        message: 'Message updated.'
      })
    });
  })
}