const Reservation = require("../models/reservation");
const Place = require("../models/place");
const { validationResult } = require("express-validator");
const ObjectId = require("mongodb").ObjectId;
const aes256 = require("../utils/aes-crypto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/user");
const { enabled } = require("express/lib/application");

exports.getReservations = async (req, res, next) => {
  const { placeId } = req.params;
  const { placeOwner } = req.query;
  let query = {};
  query.userId = req.userId;
  if (placeId) query.placeId = aes256.decryptData(placeId);
  try {
    if (placeOwner === "true") {
      // find all reservations of places that user created
      const places = await Place.find({ userId: req.userId });
      if (!places || places.length === 0) {
        const err = new Error("Can not find place");
        err.statusCode = 404;
        throw err;
      }
      const placeIds = places.map((place) => place._id);
      query.placeId = { $in: placeIds };
      delete query.userId;
    }
    const reservations = await Reservation.find(query, null, {
      sort: { createdAt: -1 },
    })
      .populate({
        path: "placeId",
        select: "category location title price imageSrc",
      })
      .select("placeId startDate endDate totalPrice status")
      .exec();
    if (!reservations || reservations.length === 0) {
      const err = new Error("Can not find reservation");
      err.statusCode = 404;
      throw err;
    }
    // encrypt all id
    const encryptReservation = reservations.map((reservation) => {
      if (!reservation.placeId) return null;
      return {
        ...reservation,
        _id: aes256.encryptData(reservation._id.toString()),
        placeReservationParams: aes256.encryptData(
          reservation.placeId._id.toString()
        ),
      };
    });

    const filteredData = encryptReservation.filter((data) => data !== null);

    res.status(200).json({
      message: "Fetched reservations successfully.",
      reservations: filteredData,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getReservation = async (req, res, next) => {
  const reservationId = aes256.decryptData(req.params.reservationId);
  try {
    const reservation = await Reservation.findById(reservationId)
      .populate({
        path: "placeId",
        populate: {
          path: "userId",
        },
      })
      .select("startDate endDate totalPrice invoice userId status");
    if (!reservation) {
      const error = new Error("Could not find reservation.");
      error.statusCode = 404;
      throw error;
    }
    let user = null;
    if (reservation.userId) user = await User.findById(reservation.userId);
    const formatData = {
      placeId: aes256.encryptData(reservation.placeId._id.toString()),
      reservationId: aes256.encryptData(reservation._id.toString()),
      status: reservation.status,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      totalPrice: reservation.totalPrice,
      invoice: reservation.invoice,
      category: reservation.placeId.category,
      location: reservation.placeId.locationValue,
      price: reservation.placeId.price,
      imageSrc: reservation.placeId.imageSrc,
      title: reservation.placeId.title,
      description: reservation.placeId.description,
      roomCount: reservation.placeId.roomCount,
      bathroomCount: reservation.placeId.bathroomCount,
      guestCapacity: reservation.placeId.guestCapacity,
      amenities: reservation.placeId.amenities,
      creator: reservation.placeId.userId.email,
    };
    if (user)
      formatData.user = {
        name: user.name,
        email: user.email,
      };
    res
      .status(200)
      .json({ message: "Place fetched.", reservation: formatData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.cancelReservation = async (req, res, next) => {
  try {
    const reservationId = aes256.decryptData(req.params.reservationId);
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      const error = new Error("Could not find reservation.");
      error.statusCode = 404;
      throw error;
    }
    // refund payment
    const refund = await stripe.refunds.create({
      payment_intent: reservation.payment_intent,
      reason: "requested_by_customer",
      // refund_application_fee: true,
      // reverse_transfer: true,
    });
    const place = await Place.findById(reservation.placeId);
    if (
      place &&
      place.reservations.length > 0 &&
      place.reservations.includes(reservationId)
    ) {
      place.reservations.pull(reservationId);
      await place.save();
    }
    const user = await User.findById(reservation.userId);
    if (
      user &&
      user.reservations.length > 0 &&
      user.reservations.includes(reservationId)
    ) {
      user.reservations.pull(reservationId);
      await user.save();
    }
    // update reservation status
    reservation.status = "cancelled";
    await reservation.save();
    res.status(200).json({ message: "Reservation deleted." });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.payment = async (req, res, next) => {
  const err = validationResult(req);
  try {
    if (!err.isEmpty()) {
      const errs = new Error("Validation failed, entered data is incorrect!");
      errs.statusCode = 422;
      errs.data = err.array();
      throw errs;
    }
    const placeId = new ObjectId(aes256.decryptData(req.body.placeId));
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const totalPrice = req.body.totalPrice;
    const totalDays = req.body.totalDays;
    const place = await Place.findById(placeId);
    if (!place) {
      const error = new Error("Could not find place.");
      error.statusCode = 404;
      throw error;
    }

    const reservation = new Reservation({
      userId: req.userId,
      placeId: placeId,
      startDate: startDate,
      endDate: endDate,
      totalPrice: totalPrice,
      payment_method_types: "card",
    });
    const user = await User.findById(req.userId);
    const customer_email = user.email;

    const link =
      process.env.CLIENT_URL +
      "checkout_success?paymentId=" +
      aes256.encryptData(reservation._id.toString());
    const cancel_link =
      process.env.CLIENT_URL +
      "?cancel=true&reservationId=" +
      aes256.encryptData(reservation._id.toString());

    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: place.title,
            images: [place.imageSrc],
            description: place.description,
            metadata: {
              reservation_id: reservation._id.toString(),
              place_id: place._id.toString(),
              user_id: req.userId.toString(),
            },
          },
          unit_amount: place.price * 100,
        },
        quantity: totalDays,
      },
    ];

    let result;

    try {
      const customer = await stripe.customers.create({
        email: customer_email,
        metadata: {
          userId: req.userId.toString(),
        },
      });

      result = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        phone_number_collection: {
          enabled: true,
        },
        line_items: line_items,
        mode: "payment",
        customer: customer.id,
        success_url: link,
        cancel_url: cancel_link,
      });

      // console.log(result);
      reservation.paymentId = result.id;

      req.session.checkoutId = result.id;

      await reservation.save();
      place.reservations.push(reservation);
      await place.save();
      user.reservations.push(reservation._id);
      await user.save();

      res.status(200).json({ url: result.url });
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.checkoutSuccess = async (req, res, next) => {
  try {
    const paymentId = aes256.decryptData(req.query.paymentId);
    const { checkoutId } = req.session;
    const session = await stripe.checkout.sessions.retrieve(checkoutId);
    // console.log(session);
    const reservation = await Reservation.findById(paymentId);
    if (!reservation) {
      const error = new Error("Reservation not found.");
      error.statusCode = 404;
      throw error;
    }
    const place = await Place.findById(reservation.placeId);
    if (!place) {
      const error = new Error("Place not found.");
      error.statusCode = 404;
      throw error;
    }
    if (!session.customer) {
      const error = new Error("Payment failed.");
      error.statusCode = 500;
      throw error;
    }
    reservation.payment_intent = session.payment_intent;
    if (session.payment_status === "paid") {
      const invoice = await stripe.invoices.create({
        customer: session.customer,
        collection_method: "send_invoice",
        days_until_due: 30,
        metadata: {
          reservation_id: paymentId,
          place_id: place._id.toString(),
          user_id: session.metadata.user_id,
        },
        description: "Reservation for " + session.metadata.place_id,
        custom_fields: [
          {
            name: "Reservation ID",
            value: paymentId,
          },
          {
            name: "Place",
            value: place.title,
          },
        ],
        footer: "Thank you for booking with us.",
        rendering_options: {
          amount_tax_display: "exclude_tax",
        },
      });
      // caculate total days
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      const totalDays =
        Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const invoiceItem = await stripe.invoiceItems.create({
        customer: session.customer,
        currency: "usd",
        unit_amount: place.price * 100,
        description: "Reservation for " + place.title,
        quantity: totalDays,
        metadata: {
          reservation_id: paymentId,
          place_id: place._id.toString(),
          user_id: session.metadata.user_id,
        },
        invoice: invoice.id,
      });

      const invoice_pdf = await stripe.invoices.finalizeInvoice(invoice.id);
      reservation.invoice = invoice_pdf.hosted_invoice_url;
      reservation.status = "paid";
      await reservation.save();
      await stripe.invoices.sendInvoice(invoice_pdf.id);
      // console.log(invoice_pdf);
      res.status(200).json({
        message: "Payment successful.",
        invoice: invoice_pdf.hosted_invoice_url,
      });
    } else {
      const user = await User.findById(req.userId);
      user.reservations.pull(paymentId);
      await user.save();
      place.reservations.pull(paymentId);
      await place.save();
      reservation.status = "cancelled";
      await reservation.save();

      const error = new Error("Payment failed.");
      error.statusCode = 500;
      throw error;
    }
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.cancelPayment = async (req, res, next) => {
  try {
    const reservationId = aes256.decryptData(req.params.reservationId);
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(200).json({ message: "Reservation cancelled." });
    }
    const place = await Place.findById(reservation.placeId);
    if (
      place &&
      place.reservations.length > 0 &&
      place.reservations.includes(reservationId)
    ) {
      place.reservations.pull(reservationId);
      await place.save();
    }
    const user = await User.findById(req.userId);
    if (
      user &&
      user.reservations.length > 0 &&
      user.reservations.includes(reservationId)
    ) {
      user.reservations.pull(reservationId);
      await user.save();
    }
    // update reservation status
    reservation.status = "cancelled";
    await reservation.save();
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
