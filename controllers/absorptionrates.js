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
  router.get('/api/getMonthsAbsorption', function (request, response) {

    AbsorptionRates.find({}, { "Date": 1,"_id": 0 }, function(err, months) {
        if(err){
            // console.log(err);
            return res.status(500).send(err);
          } else{
              // console.log('months:', months);
              var onlyDates = [];
              onlyDates = months.map((m) => {
                return m.Date;
              });

               var uniqueDates = onlyDates
              .map(s => s.toString())
              .filter((s, i, a) => a.indexOf(s) == i)
              .map(s => new Date(s));

              console.log("uniqueDates:", uniqueDates);
              response.send(uniqueDates);
          }
    });
  });

  // get all neighborhoods in absorption rates
  router.get('/api/getNeighborhoodsAbRt', function (request, response) {

    AbsorptionRates.find({}, { "neighborhoodName": 1, "_id": 0 }, function(err, neighborhoods) {
        if(err){
            // console.log(err);
            return res.status(500).send(err);
          } else{
              // console.log('neighborhoods:', neighborhoods);
              response.send(neighborhoods);
          }
    });
  });

  // get one neighborhood based on specific date and neibhorhood from absorption rates
  router.post('/api/getOneNeighborhoodAbRt', function (request, response) {

    console.log("getOneNeighborhoodAbRt called");

    console.log("request.body:", request.body);
    
    var nbrName = request.body.name;
    var nbrDate = new Date(request.body.date);
    console.log("nbrName", nbrName);
    console.log("nbrDate", nbrDate);

    AbsorptionRates.find({
          $and: [
              {'neighborhoodName': nbrName},
              {'Date': new Date(nbrDate)}
          ]
    }, function(err, abRtOneNeibhorhood) {
        if(err){
            console.log(err);
            return res.status(500).send(err);
          } else{
              console.log('abRtOneNeibhorhood:', abRtOneNeibhorhood);
              response.send(abRtOneNeibhorhood);
          }
    });
    
  });

  // get the absorption data
  router.get('/api/getAllNeighborhoodsAbRt/:nmYr', function (request, response) {

    // console.log("getAllNeighborhoodsAbRt called");
    var reqNmYr = request.params.nmYr;
    // console.log("new Date(reqNmYr)", new Date(reqNmYr));

    AbsorptionRates.find({'Date': new Date(reqNmYr)}, function(err, absorptionRatess) {
        if(err){
            console.log(err);
            return response.status(500).send(err);
          } else{
              // console.log('absorptionRatess:', absorptionRatess);
              response.send(absorptionRatess);
          }
    });
  });


  module.exports = router;