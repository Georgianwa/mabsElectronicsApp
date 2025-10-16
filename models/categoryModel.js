const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
    }
});

module.exports = mongoose.model('Category', categorySchema);
