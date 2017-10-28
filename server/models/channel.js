const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const ChannelSchema = new Schema({
  channelName: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Channel', ChannelSchema);