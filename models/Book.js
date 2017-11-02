const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.Promise = require('bluebird');

const bookSchema = new Schema({
    title: {type: String},
    created_on: {type: Date, default: Date.now},
    isDeleted: { type: Boolean, default: false },
    _comments: [{ type: Schema.ObjectId, ref: 'Comment' }]
});

module.exports = mongoose.model('Book', bookSchema);
