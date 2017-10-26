const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  channelName: {
    type: String
  }
});

module.exports = mongoose.model('Conversation', ConversationSchema);