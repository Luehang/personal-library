const express = require('express');
const mongoose = require('mongoose');
const Book = require('./../models/Book');
const Comment = require('./../models/Comment');

const router = express.Router();

router.get('/', (req, res) => {
    Book.find({isDeleted: false}).populate({
        path: '_comments',
        select: 'text created_on -_id',
        match: { 'isDeleted': false }
    }).then((books) => {
        // res.json({ books: books })
        res.status(200).render('layout', {
            books: books
        });
    }).catch((err) => {
        res.status(500).render('layout', {
            message: "Unable to fetch data."
        });
    })
})

router.use((req, res, next) => {
    if (req.url === '/books/id' && req.body.comment && req.body._id) {
        req.url += req.body._id.toString();
        return next();
    }
    return next();
})

router.route('/books')
    .post(
        (req, res, next) => {
            if (req.url === '/books' && req.body.title) {
                return next();
            }
            return res.end();
        },
        (req, res) => {
        const { title } = req.body;

        const book = new Book({
            title: title
        });

        book.save().then((newBook) => {
            Book.find({ 'isDeleted': false }, null, {new: true}, (err, docs) => {
                res.status(200).render('layout', {
                    message: "Saved successfully.",
                    books: docs
                });
            })
        }).catch((err) => {
            res.status(500).render('layout', {
                message: "Saved unsuccessfully."
            });
        })
    })
    .get((req, res) => {
        Book.find({isDeleted: false}).populate({
            path: '_comment',
            select: 'text created_on -_id',
            match: { 'isDeleted': false }
        }).then((books) => {
            res.status(200).render('layout', {
                books: books
            });
        }).catch((err) => {
            res.status(500).render('layout', {
                message: "Unable to fetch data."
            });
        })
    })
    .delete((req, res) => {
        Book.where()
            .setOptions({multi: true})
            .update({$set: {isDeleted: true} }, (err, books) =>{
                Book.find({isDeleted: false}).populate({
                    path: '_comments',
                    select: 'text created_on -_id',
                    match: { 'isDeleted': false }
                }).then((books) => {
                    // res.json({ books: books })
                    res.status(200).render('layout', {
                        message: "Deleted all successfully.",
                        books: books
                    });
                }).catch((err) => {
                    res.status(500).render('layout', {
                        message: "Unable to fetch data."
                    });
                })
            })
    })
    

router.route('/books/:id?')
    .get((req, res) => {
        Book.find({ _id: req.params.id }).populate({
            path: '_comments',
            select: 'text created_on _id',
            match: { 'isDeleted': false }
        }).then((book) => {
            // res.json({ book });
            // console.log(book[0]._comments[0].text);
            res.status(200).render('layout', {
                message: "Sent successfully.",
                book: book[0],
                title: book[0].title,
                comments: book[0]._comments
            });
        }).catch((err) => {
            Book.find({isDeleted: false}).populate({
                path: '_comments',
                select: 'text created_on -_id',
                match: { 'isDeleted': false }
            }).then((books) => {
                // res.json({ books: books })
                res.status(200).render('layout', {
                    message: "Please double check your ID and try again.",
                    books: books
                });
            }).catch((err) => {
                res.status(500).render('layout', {
                    message: "Unable to fetch data."
                });
            })
        })
    })
    .post(
        (req, res, next) => {
            let id = "";
            if (req.body._id) {
                id = req.body._id;
            } else {
                id = req.params.id;
            }
            Book.find({_id: req.body._id}).then((book) => {
                return next();
            }).catch((err) => {
                res.status(404).render('layout', {
                    message: "No book exist."
                });
            })
        },
        (req, res) => {
            const { text } = req.body;
            let id = "";
            if (req.body._id) {
                id = req.body._id;
            } else {
                id = req.params.id;
            }

            const comment = new Comment({
                text: text,
                _book: id
            });

            comment.save().then((newComment) => {
                Book.findByIdAndUpdate(
                    id,
                    { $push: { '_comments': newComment._id } },
                    { new: true }
                ).then((existingBook) => {
                    Book.find({_id: existingBook._id}).populate({
                        path: '_comments',
                        select: 'text created_on _id',
                        match: { 'isDeleted': false }
                    }).then((book) => {
                        // res.json({ book });
                        // console.log(book[0]._comments[0].text);
                        res.status(200).render('layout', {
                            message: "Sent successfully.",
                            book: book[0],
                            title: book[0].title,
                            comments: book[0]._comments
                        });
                    })
                }).catch((err) => {
                    res.status(500).render('layout', {
                        message: "Unable to fetch data."
                    });
                })
            }).catch((err) => {
                res.status(500).json({
                    message: "Sent unsuccessfully. Please try again."
                });
            });
        }
    )
    .delete(
        (req, res) => {
            const { id } = req.params;
            Book.findByIdAndUpdate(
                id,
                { $set: { 'isDeleted': true } },
                { new: true },
                (err, book) => {
                    if (err) {
                        return res.redirect('/');
                    }
                    Book.find({isDeleted: false}).populate({
                        path: '_comments',
                        select: 'text created_on -_id',
                        match: { 'isDeleted': false }
                    }).then((books) => {
                        res.status(200).render('layout', {
                            message: "Deletion successful.",
                            books: books
                        });
                    }).catch((err) => {
                        res.status(500).render('layout', {
                            message: "Unable to fetch data."
                        });
                    })
                }
            )
            // Book.findByIdAndRemove(req.params.id).catch((err) => {
            //     res.status(500).render('layout', {
            //           message: "Deletion unsucessful."
            //     });
            // });
        }
    )

module.exports = router;
