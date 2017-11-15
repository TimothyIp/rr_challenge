const mongoose = require('mongoose'),
Schema = mongoose.Schema;

// Creates a guest account that will expire in 2 hours
const GuestSchema = new Schema({
  guestName: {
    type: String,
    required: true,
    unique: true
  },
  messages: {
    type: String
  },
  // expire_at: {
  //   type: Date,
  //   default: Date.now,
  //   expires: 7200
  // }
},
{
  timestamps: true
})

module.exports = mongoose.model('Guest', GuestSchema);