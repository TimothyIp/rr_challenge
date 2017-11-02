"use strict"

const User = require('../models/user');

// Takes a channel name and the current username
// If a user is found, that channel is pushed into the user's userChannel array
exports.addChannel = function(req, res, next) {

  const channelToAdd = req.body.createInput;
  const username = req.user.username;

  User.findOne({ username }, function(err, user) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }
    
    if (!user) {
      return res.status(422).json({
        error: 'Could not find user.'
      })
    }
   
   // This prevents the user from joining duplicate channels
   if (user.usersChannels.indexOf(channelToAdd) == -1 ) {
    user.usersChannels.push(channelToAdd);
   } else {
     return res.status(422).json({
       error: 'Already joined that channel.'
     })
   }

   user.save(function(err, updatedUser) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    res.status(200).json({
      message: 'Successfully joined channel.',
      channels: user.usersChannels
    });
   });
  });
}

// Takes a channel name and username
// If a user is found, it looks through the user's usersChannel array
// The request channel to remove is filtered from the array and the user's info is saved again
// Returns the new usersChannel array in the json response
exports.removeChannel = function(req, res, next) {
  const channelName = req.body.channel;
  const username = req.user.username;
  
  User.findOne({ username }, function(err, user) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    if (!user) {
      return res.status(422).json({
        error: 'Could not find user.'
      });
    }

    // Removes the channel that was requested
    const removedChannel = user.usersChannels.filter(function(channel) {
      return channel !== channelName
    })

    user.usersChannels = removedChannel;


    user.save(function(err, updatedUser) {
      if (err) {
        res.send({
          error: err
        });
        return next(err);
      }
  
      res.status(200).json({
        message: `Removed channel: ${channelName}`,
        updatedChannels: user.usersChannels
      });
    });
  });
}

// Given a username
// Looks through Users for the username
// If it can find a user, it returns all their current userChannels in a json response
exports.getChannels = function(req, res, next) {
  const username = req.user.username;

  User.findOne({ username }, function(err, user) {
    if (err) {
      res.send({
        error: err
      });
      return next(err);
    }

    if (!user) {
      return res.status(422).json({
        error: 'Could not find user.'
      });
    }
    
    res.status(200).json({
      message: 'Here are the users channels',
      usersChannels
    });
  });
}