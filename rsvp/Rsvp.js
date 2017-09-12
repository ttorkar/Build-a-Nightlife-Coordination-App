const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Rsvp = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  yelpId: {
    type:String,
    required:true,
  },
})

module.exports = mongoose.model('Rsvp', Rsvp)
