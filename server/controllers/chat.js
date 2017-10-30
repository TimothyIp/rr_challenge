"use strict"

const Conversation = require('../models/conversation'),
      Message = require('../models/message'),
      User = require('../models/user'),
      Channel = require('../models/channel');

exports.newConversation = function(req, res, next) {
  const recipient = req.body.startDmInput;
  const userId = req.user._id

  if (!recipient) {
    res.status(422).send({
      error: "Enter a valid recipient."
    });
    return next();
  }

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

    console.log(foundRecipient)

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
        recipient: foundRecipient.username
      })

    });

  });
}

exports.leaveConversation = function(req, res, next) {
  const conversationToLeave = req.body.conversationId;
  
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

exports.postToChannel = function(req, res, next) {
  const channelName = req.params.channelName;
  const composedMessage = req.body.composedMessage;

  console.log(req.user)

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

  // Tells mongodb which to schema to reference a guest or user collection
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

exports.getConversations = function (req, res, next) {
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
        const conversationWith = conversation.participants[1];
        
        conversationList.push(conversationWith);
        if (conversationList.length === conversations.length) {
          return res.status(200).json({
            conversationsWith: conversationList
          })
        }
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

  console.log("SEND REPLY REQ BODY", req.body)

  // const reply = new Message({
  //   conversationId: req.params.recipientId,
  //   body: req.body.composedMessage,
  //   author: req.user._id
  // });

  // reply.save(function(err, sentReply) {
  //   if (err) {
  //     res.send({
  //       error: err
  //     });
  //     return next(err);
  //   }

  //   res.status(200).json({
  //     message: 'Reply sent.'
  //   });
  //   return next();
  // });
}