import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  _id: string;
  customer: mongoose.Types.ObjectId | string;
  products: [
    {
      product: mongoose.Types.ObjectId | string;
      quantity: number;
    },
  ];
  deliveryPerson: mongoose.Types.ObjectId | string;
  isAccepted: boolean;
  isDelivered: boolean;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: mongoose.Types.ObjectId | string;
    note: string;
  }>;
  deliveryRating: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  estimatedDeliveryTime: Date;
  actualDeliveryTime: Date;
  createdAt: Date;
  updatedAt: Date;
  locked: boolean;
  lockExpiresAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "India",
      },
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "CARD", "UPI"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      required: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        note: {
          type: String,
          default: "",
        },
      },
    ],
    deliveryRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    lockExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Add index for faster order status queries
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ deliveryPerson: 1 });

// Add method to update order status with history
orderSchema.methods.updateStatus = async function (
  status: string,
  userId: string,
  note: string = ""
) {
  this.orderStatus = status;

  if (status === "accepted") {
    this.isAccepted = true;
    this.deliveryPerson = userId;
  }

  if (status === "delivered") {
    this.isDelivered = true;
    this.actualDeliveryTime = new Date();
  }

  this.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: userId,
    note,
  });

  return this.save();
};

const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", orderSchema);
export default OrderModel;
