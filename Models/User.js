const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  messages: {
    type: Map,
    of: {
      _id : false,
      roomId: String,
      messageHistory: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
    },
    required: false,
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

