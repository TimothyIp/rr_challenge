const passport = require('passport'),
      User = require('../models/user'),
      Guest = require('../models/guest'),
      config = require('./main'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt,
      LocalStrategy = require('passport-local');

const localOptions = {
  usernameField: 'username'
};

//Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, function(username, password, done) {
  User.findOne({ username }, function(err, user) {
    if (err) { 
      return done(err); 
    }
    if (!user) {
      return done(null, false, {
        error: 'Your login details could not be verified. Please try again.'
      });
    }

    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        return done(err);
      }
      
      if (!isMatch) {
        return done(null, false, {
          error: 'Your login details could not be verified. Please try again.'
        });
      }
      
      return done(null, user);
    });
  });
});

const jwtOptions = {
  // Tells passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  // Tells passport where to find secret
  secretOrKey: config.secret
};

// JWT login strategy setup
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  console.log(payload);
  User.findById(payload._id, function(err, user) {
    if (err) {
      return done(err, false);
    }

    if (user) {
      done(null, user);
    } else {
      // Reads guest token for api calls
      Guest.findOne(payload.guestName, function(err, guest) {
        if (err) {
          return done(err, false);
        }

        if (guest) {
          done(null, guest)
        } else {
          done(null, false);
        }
      });
    }
  });
});

passport.use(jwtLogin);
passport.use(localLogin);