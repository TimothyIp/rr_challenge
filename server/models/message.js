const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  globalChat: {
    type: Boolean
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);