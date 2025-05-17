import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
    _id: string;
    customer: mongoose.Types.ObjectId | string;
    products: mongoose.Types.ObjectId[] | string[];
    acceptedBy: mongoose.Types.ObjectId | string;
    isAccepted: boolean;
    isDelivered: boolean;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Product",
            required: true,
        },
        acceptedBy: {
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
            type: String,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentStatus: {
            type: String,
            required: true,
        },
        orderStatus: {
            type: String,
            enum: ["pending", "accepted", "shipped", "delivered", "cancelled"],
            default: "pending",
            required: true,
        },
    },
    { timestamps: true }
);

const OrderModel =
    (mongoose.models.Order as mongoose.Model<IOrder>) ||
    mongoose.model<IOrder>("Order", orderSchema);
export default OrderModel;
