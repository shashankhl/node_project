const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All tour',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // console.log(req);
  // or we could have user res.locals.user
  // if any problem check authcontroller getuser and comment req.user=currentUser
  if (req.user) {
    // console.log('🤩');
    const bookings = await Booking.find({ user: req.user.id });
    const tourIDs = bookings.map((el) => el.tour);
    const userBookedTour = await Tour.find({ _id: { $in: tourIDs } });
    // console.log(userBookedTour);

    if (userBookedTour) {
      userBookedTour.forEach((t) => {
        if (t.id === tour.id) {
          res.locals.alreadyBooked = true;
        }
      });
    }
  }

  const booking = await Booking.findOne({ user: res.locals.user, tour: tour });

  let commentExist;
  if (res.locals.user) {
    commentExist = tour.reviews.some(
      (review) => review.user.id === res.locals.user.id
    );
  }

  let booked;

  // if (booking) {
  //   booked = true;
  // } else {
  //   booked = false;
  // }
  booked = booking ? true : false;

  // 2) Build template

  // 3) Render template using data from 1)
  res
    .status(200)
    // .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000/")
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
      booked,
      commentExist,
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "connect-src 'self' https://cdnjs.cloudflare.com"
    // )
    .render('login', {
      title: 'Log into your account',
    });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: `Create New Account`,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  if (bookings.length === 0) {
    return next(new AppError('You have not made any Bookings', 404));
  }

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  // 1) Get reviews of the currently logged in user

  const reviews = await Review.find({ user: res.locals.user.id }).populate({
    path: 'tour',
    select: 'name slug',
  });

  if (reviews.length === 0) {
    return next(new AppError('You have not made any reviews', 404));
  }

  res.status(200).render('reviews', {
    title: 'My reviews',
    reviews,
    toursNames: true,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log('UPDATING USER', req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
