const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  conversations: [{
    question: String,
    text: String,
    video: String,
    products: [{
      title: String,
      link: String
    }],
    videoLinks: { type: Map, of: String }
  }],
  searchHistory: [String],
  selectedIndex: { type: String, default: 'bents' }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
