var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose');

// Categories Schema
var absorptionRatesSchema = mongoose.Schema({
  neighborhoodName: String,
  APT: String,
  CONDO: String,
  COOP: String,
  Date: Date
});

var AbsorptionRates = mongoose.model('AbsorptionRates', absorptionRatesSchema);

// get the dates for absorption dropdown
router.get('/api/getMonthsAbsorption', function(request, response) {
  AbsorptionRates.find({}, { Date: 1, _id: 0 }, function(err, months) {
    if (err) {
      return res.status(500).send(err);
    } else {
      var onlyDates = [];
      onlyDates = months.map(m => {
        return m.Date;
      });

      var uniqueDates = onlyDates
        .map(s => s.toString())
        .filter((s, i, a) => a.indexOf(s) == i)
        .map(s => new Date(s));
      response.send(uniqueDates);
    }
  });
});

// get all neighborhoods in absorption rates
router.get('/api/getNeighborhoodsAbRt', function(request, response) {
  AbsorptionRates.find({}, { neighborhoodName: 1, _id: 0 }, function(
    err,
    neighborhoods
  ) {
    if (err) {
      return res.status(500).send(err);
    } else {
      response.send(neighborhoods);
    }
  });
});

// get one neighborhood based on specific date and neibhorhood from absorption rates
router.post('/api/getOneNeighborhoodAbRt', function(request, response) {
  var nbrName = request.body.name;
  var nbrDate = new Date(request.body.date);

  AbsorptionRates.find(
    {
      $and: [{ neighborhoodName: nbrName }, { Date: new Date(nbrDate) }]
    },
    function(err, abRtOneNeibhorhood) {
      if (err) {
        return res.status(500).send(err);
      } else {
        response.send(abRtOneNeibhorhood);
      }
    }
  );
});

// get the absorption data
router.get('/api/getAllNeighborhoodsAbRt/:nmYr', function(request, response) {
  var reqNmYr = request.params.nmYr;
  AbsorptionRates.find({ Date: new Date(reqNmYr) }, function(
    err,
    absorptionRatess
  ) {
    if (err) {
      return response.status(500).send(err);
    } else {
      response.send(absorptionRatess);
    }
  });
});

module.exports = router;
