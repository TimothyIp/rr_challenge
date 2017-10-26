"use strict"

const jwt = require('jsonwebtoken'),
      User = require('../models/user'),
      config = require('../config/main');

function generateToken(user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 20000
  });
}

function setUserInfo(req) {
  return {
    _id: req._id,
    username: req.username,
    role: req.role,
  }
}

// LOGIN ROUTE
exports.login = function(req, res, next) {
  console.log(req.user)
  let userInfo = setUserInfo(req.user);

  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  })
}

// REGISTRATION ROUTE
exports.register = function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if(!username) {
    return res.status(422).send({
      error: 'You must enter a username.'
    });
  }

  if (!password) {
    return res.status(422).send({
      error: 'You must enter a password.'
    })
  }

  User.findOne({ username }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      return res.status(422).send({
        error: 'That username is already in use.'
      });
    }

    //If email is unique and password is provied -> create account
    let user = new User({
      username: username,
      password: password,
    });

    user.save(function(err, user) {
      if (err) {
        return next(err);
      }

      let userInfo = setUserInfo(user);

      res.status(201).json({
        token: 'JWT ' + generateToken(userInfo),
        user: userInfo,
        message: "Successfully created your account"
      });
    });
  });
}

// Role authorization check
exports.roleAuthorization = function(role) {
  return function(req, res, next) {
    const user = req.user;

    User.findById(user._id, function(err, foundUser) {
      if (err) {
        res.status(422).json({
          error: 'No user was found.'
        })
      }

      if (foundUser.role == role) {
        return next();
      }

      res.status(401).json({
        error: 'You are not authorized to view this content.'
      });

      return next('Unauthorized');
    })
  }
}