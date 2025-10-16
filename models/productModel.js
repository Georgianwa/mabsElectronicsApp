const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 1000
    },

    role: {
        type: String,
        enum: [
            "admin", 
            "user", 
            "guest", 
            "developer"
        ],
        default: "guest"
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Product', productSchema);

