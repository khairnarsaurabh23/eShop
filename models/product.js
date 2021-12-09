//create a product Schema

const mongoose = require('mongoose');


const product = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is mandetory field"],
    trim: true,
    maxlength: [100, "Product name must be less than 100 chars"],
  },
  price: {
    type: Number,
    required: [true, "Price is a mandetory field"],
  },
  description: {
    type: String,
    required: [true, "Discription is a mandetory field"],
  },
  photos: [
    //each photo must have following properties
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "please select from given categories"],
    enum: {
      values: ["Electronic Gadget", "Cloathing", "Playwood", "Accessories", "SunGlasses"],
      message:"please select from given categories",
    },
  },
  //this field was updated in order videos later
  stock: {
    type: Number,
    required: [true, "please add a number in stock"],
  },
  brand: {
    type: String,
    required: [true, "please add a brand for clothing"],
  },
  avgRating: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: mongoose.Schema.ObjectId,
    ref: "Review"
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});




module.exports = mongoose.model('Product', product);
