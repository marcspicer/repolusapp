var express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  app = express();

// middlewares
app.use(bodyParser.json());
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());

// import controllers
app.use(require('./controllers/neighborhoods'));
app.use(require('./controllers/categories'));
app.use(require('./controllers/absorptionrates'));
app.use(require('./controllers/marketReportsManhattan'));
app.use(require('./controllers/marketReportsBrooklyn'));
app.use(require('./controllers/contact'));

// serve the angular index file work
const path = require('path');
app.use(express.static(__dirname + '/public'));

// connection to mongodb
var mongoose = require('mongoose');
var database = 'mongodb://localhost/repolus';
mongoose.connect(database).then(
  () => {
    console.log('MongoDb is readay to use.');
  },
  err => {
    console.log('handle initial connection error to MongoDb');
  }
);

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
// app.get('*', function (request, response) {
//   response.sendFile(path.resolve(__dirname, 'index.html'));
// });
// end serve the angular index file work

const port = 5000;
var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Repolus Server listening on', port);
});
