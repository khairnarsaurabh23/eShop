//models for reiews

const mongoose = require('mongoose');


const review = new mongoose.Schema({
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
});



module.exports = mongoose.model('Review', review);
