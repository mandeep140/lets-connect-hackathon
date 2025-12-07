import mongoose from 'mongoose';

const pnrSchema = new mongoose.Schema({
  pnr: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: 10
  },
  train: {
    type: String,
    required: true,
    trim: true
  },
  route: {
    type: String,
    required: true,
    trim: true
  },
  distance: {
    type: String,
    required: true,
    trim: true
  },
  estimatedTime: {
    type: String,
    required: true,
    trim: true
  },
  passengers: [{
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true
    },
    berth: {
      type: String,
      required: true
    }
  }],
  connections: [{
    type: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const PNR = mongoose.models.PNR || mongoose.model('PNR', pnrSchema);

export default PNR;
