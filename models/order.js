const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    product: [
        {
            producctId: {
                type: String
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object
    },
    status: {
        type: String,
        default: "Pending"
    }
}, 
{ timestamps: true })


module.exports = mongoose.model("orders", orderSchema)