var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose');

// Categories Schema
var marketReportsBrkSchema = mongoose.Schema({
  NeighborhoodName: String,
  Quarter: String,
  Sales: Number,
  AveragePrice: String,
  MedianPrice: String,
  AveragePPRoom: String,
  DaysonMarket: Number,
  SellingVsAsking: String
});

var MarketReportsBrooklyns = mongoose.model(
  'MarketReportsBrooklyns',
  marketReportsBrkSchema
);

// get one neighborhood market reports based on specific neighborhood name.
router.post('/api/getOneNeighborhoodMRBrooklyn', function(request, response) {
  MarketReportsBrooklyns.find(
    {
      $and: [
        { NeighborhoodName: request.body.name },
        {
          Year: {
            $gte: request.body.dateRange.startYear,
            $lte: request.body.dateRange.endYear
          }
        }
      ]
    },
    function(err, mrRpOneNeibhorhood) {
      if (err) {
        return res.status(500).send(err);
      } else {
        response.send(mrRpOneNeibhorhood);
      }
    }
  );
});

module.exports = router;
