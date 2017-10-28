const mongoose = require('mongoose'),
Schema = mongoose.Schema,
bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  messages: {
    type: String
  },
  usersChannels: {
    type: Array,
    default: ['Public-Main']
  }
},
{
  timestamps: true
});

// Hash password before saving if new or modified
UserSchema.pre('save', function(next) {
  const user = this,
    SALT_FACTOR = 5;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) {
    return next(err);
    }

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }
    user.password = hash;
    next();
    });
  });
});

//Compares password for login
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
}

module.exports = mongoose.model('User', UserSchema);