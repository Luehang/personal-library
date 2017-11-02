const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.Promise = require('bluebird');

const commentSchema = new Schema({
    text: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    _book: { type: Schema.ObjectId, ref: 'Book' }
});

const autoPopulateBook = function(next) {
    this.populate({
        path: '_book',
        select: 'title -_id'
    });
    next();
}

commentSchema.pre('find', autoPopulateBook);

module.exports = mongoose.model('Comment', commentSchema);
