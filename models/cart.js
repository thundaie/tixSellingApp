const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
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
    ]
}, 
{ timestamps: true })


module.exports = mongoose.model("carts", cartSchema)