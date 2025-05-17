import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  cart: {
    products: Array<{ product: mongoose.Types.ObjectId; quantity: number }>;
  };
  orders: mongoose.Types.ObjectId[] | string[];
  address: string;
  phone: string;
  profilePicture: string;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpiry: Date;
  passwordResetToken: string;
  passwordResetTokenExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "delivery"],
      default: "customer",
    },
    cart: {
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            default: 1,
          },
        },
      ],
    },
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Order",
      default: [],
    },
    address: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: "",
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: "",
    },
    passwordResetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const UserModel =
  mongoose.models?.User || mongoose.model<IUser>("User", userSchema);
export default UserModel;
