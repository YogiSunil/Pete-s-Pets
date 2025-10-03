if (!process.env.PORT) {
  require('dotenv').config()
  process.env.NODE_ENV = "dev"
}

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon'); // Middleware to serve favicon.ico
const logger = require('morgan'); // HTTP request logger middleware for node.js
const cookieParser = require('cookie-parser'); // Parse Cookie header and populate req.cookies
const bodyParser = require('body-parser'); // Node.js body parsing middleware - parses incoming request bodies
const methodOverride = require('method-override') // Override HTTP methods using query value

const app = express();

const mongoose = require('mongoose');

// MongoDB connection with error handling
mongoose.connect('mongodb://localhost/local', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully to localhost/local');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

// Override HTTP methods - allows PUT/DELETE via form submissions using ?_method=DELETE or ?_method=PUT
app.use(methodOverride('_method'))

// Serve favicon.ico from /public directory (currently commented out)
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// Log HTTP requests in development format (includes method, url, status, response time)
app.use(logger('dev'));
// Parse URL-encoded bodies (from HTML forms) with extended set to false for simple key-value pairs
app.use(bodyParser.urlencoded({ extended: false }));
// Parse JSON bodies from incoming requests
app.use(bodyParser.json());
// Parse cookies attached to the client request object
app.use(cookieParser());


require('./routes/index.js')(app);
require('./routes/pets.js')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

module.exports = app;
