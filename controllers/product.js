const Product = require('../models/product');
// const Review = require('..//models/reviews');
const bigPromise = require('../middlewares/bigPromise');
const customError = require('../utils/cError');
const cloudinary = require('cloudinary');

//import WhereClause
const WhereClause = require('../utils/whereClause');


//testing porpose
exports.test = bigPromise(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'setup is working properly',
    });
});

//adding a product to the web store
exports.addProduct = bigPromise(async (req, res, next) => {
  // images

  let imageArray = [];

  //if no photos throw an error
  if (!req.files) {
    return next(new customError("images are required", 401));
  }

  //if photos, upload them to the cloudinary
  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      //push their details to the imageArray
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  //assign uploaded photos info to the photos in req.body
  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

//get product with provided filters
exports.getAllProduct = bigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalcountProduct = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});

//update product -> admin only controller
exports.adminUpdateProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new customError("No product found with this id", 401));
  }
  //an array to hold details of uploaded photos
  let imagesArray = [];

  if (req.files) {
    //destroy the existing image
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }
    //upload new images
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products", //folder name -> .env
        }
      );

      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imagesArray;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

//delete product
exports.adminDeleteProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new customError("No product found with this id", 401));
  }

  //destroy the existing image on cloudinary
  for (let index = 0; index < product.photos.length; index++) {
    const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product was deleted !",
  });
});


//add review
//to be reviewed
exports.deleteReview = bigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = Review.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  // adjust ratings

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //update the product
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  //update the review
    await Review.findByIdAndUpdate(
      productId,
      {
        ratings,
        numberOfReviews,
      },
      {
        new: true,
        runValidators: true,
      }
    );

  res.status(200).json({
    success: true,
  });
});
exports.addReview = bigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const AlreadyReview = Review.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (AlreadyReview) {
    Review.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    Review.reviews.push(review);
    product.numberOfReviews = Review.reviews.length;
  }

  // adjust ratings

  product.avgRatings =
    Review.reviews.reduce((acc, item) => item.rating + acc, 0) /
    Review.reviews.length;

  //save

  await Review.save();
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});
