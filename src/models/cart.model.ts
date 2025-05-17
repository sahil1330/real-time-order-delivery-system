import mongoose, { Document, Schema } from "mongoose";

export interface ICart extends Document {
  _id: string;
  user: mongoose.Types.ObjectId | string;
  products: (mongoose.Types.ObjectId | string)[];
  totalAmount: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const CartModel = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
export default CartModel;