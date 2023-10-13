/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Global Middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// CORS policy
app.use(cors());
app.options('*', cors());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
});
app.enable('trust proxy');

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", 'https://unpkg.com'],
      'img-src': ["'self'", 'data:', 'https://*.tile.openstreetmap.org'],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://unpkg.com',
        'https://js.stripe.com',
        'https://unpkg.com/',
        'https://api.mapbox.com/mapbox-gl-js/v0.54.0/mapbox-gl.js',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://127.0.0.1:*/',
      ],
      // eslint-disable-next-line no-dupe-keys
      'script-src': [
        "'self'",
        'https:',
        'http:',
        'blob:',
        'https://*.mapbox.com',
        'https://js.stripe.com',
        'https://m.stripe.network',
        'https://*.cloudflare.com',
      ],

      frameSrc: ["'self'", 'https://js.stripe.com'],
      workerSrc: ["'self'", 'data:', 'blob:', 'https://m.stripe.network'],
    },
  }),
);

app.use('/api', limiter);

// middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));
app.use(express.json({ limit: '10kb' }));

//Data sanitization against noSql query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);
// compress data
app.use(compression());

app.use((req, res, next) => {
  // console.log(req.cookies);
  next();
});

// route handlers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
app.all('*', (req, res, next) => {
  //v1
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server`,
  // });
  //v2
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //v3
  next(new AppError(`can't find ${req.originalUrl} on this server`));
});
app.use(globalErrorHandler);
module.exports = app;
