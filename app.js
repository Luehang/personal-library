const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const DATABASE = 'mongodb://127.0.0.1/personal-library';

mongoose.connect(DATABASE, { useMongoClient: true });
const db = mongoose.connection;
db.on('open', (ref) => { console.log("Connected to Mongodb successfully.") });
db.on('error', (err) => { console.log(`Connection Error: ${err}`) });

app.use(helmet({
    frameguard: {
        action: 'deny'
    },
    hidePoweredBy: {
        setTo: 'PHP 7.0.21'
    },
    xssFilter: {
        setOnOldIE: true
    },
    ieNoOpen: true,
    noCache: true,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"]
        }
    }
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

const mainRoutes = require('./routes');
app.use('/api', mainRoutes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
  
app.use((err, req, res, next) => {
    res.locals.error = err;
    res.status(err.status);
    res.render('error');
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log(`Application is running on ${listener.address().port}`);
});
