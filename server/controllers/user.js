"use strict"

const User = require('../models/user');

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
   
   // Prevents joining duplicate channels
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