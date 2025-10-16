const mongoose = require('mongoose');
const brandSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    }
});

module.exports = mongoose.model('Brand', brandSchema);
