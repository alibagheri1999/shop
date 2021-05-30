const config = require('../config')
const stripe = require('stripe')(config.secret2);
const Information = require('../models/information');
const Booking = require('../models/booking');
const catchAsync = require('../src/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const information = await Information.findById(req.params.informationId);
  console.log(information);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-information/?information=${
      req.params.informationId
    }&user=${req.user.id}&price=${information.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/information/${information.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.informationId,
    line_items: [
      {
        name: `${information.name} information`,
        description: information.summary,
        images: [`https://www.natours.dev/img/tours/${information.imageCover}`],
        amount: information.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { information, user, price } = req.query;

  if (!information && !user && !price) return next();
  await Booking.create({ information, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
