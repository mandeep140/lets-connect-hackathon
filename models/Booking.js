import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  pnr: {
    type: String,
    required: true
  },
  train: {
    type: {
      name: String,
      number: String,
      type: String
    },
    _id: false
  },
  originalTrain: {
    type: {
      name: String,
      number: String
    },
    _id: false
  },
  journey: {
    type: {
      from: String,
      fromName: String,
      to: String,
      toName: String,
      date: String,
      departure: String,
      arrival: String,
      fromPlatform: String,
      toPlatform: String
    },
    _id: false
  },
  passengers: [{
    name: String,
    age: Number,
    gender: String
  }],
  fare: {
    type: {
      total: Number,
      baseFare: Number,
      tax: Number,
      bookingCharge: Number
    },
    _id: false
  },
  class: {
    type: String,
    default: 'SL'
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  qrCode: {
    type: String
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ userId: 1, bookedAt: -1 });
bookingSchema.index({ bookingId: 1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
