import mongoose, { Schema, models } from "mongoose";

const deliveryProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car", "van", "other"],
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    ratings: [{
      orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    }],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add index for geospatial queries
deliveryProfileSchema.index({ currentLocation: "2dsphere" });

const DeliveryProfile = models.DeliveryProfile || mongoose.model("DeliveryProfile", deliveryProfileSchema);

export default DeliveryProfile;