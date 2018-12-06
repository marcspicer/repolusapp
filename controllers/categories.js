var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose');

// Categories Schema
var categoriesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  address: String,
  name: String,
  neighborhood: String,
  phone_number: String,
  category: String,
  location: {
    lat: Number,
    lng: Number
  },
  articleLink: String
});
// Categories Model
var Categories = mongoose.model('Categories', categoriesSchema);

// get the categories coordinates based on neighborhood.
router.post('/api/getCategoriesCoordinates', async function(request, response) {
  var selectedDataCategories = request.body;
  // get all the categories
  var requiredDataCategories = [];

  for (var i = 0; i < selectedDataCategories[0].neighborhoods.length; i++) {
    for (var j = 0; j < selectedDataCategories[1].categories.length; j++) {
      await Categories.find(
        {
          $and: [
            { neighborhood: selectedDataCategories[0].neighborhoods[i] },
            { category: selectedDataCategories[1].categories[j] }
          ]
        },
        function(err, category) {
          if (err) throw err;
          if (category[0] !== undefined) requiredDataCategories.push(category);
        }
      );
    }
  }

  response.send(requiredDataCategories);
});

// save the categories.
router.post('/api/saveCategoriesCoordinates', function(request, response) {
  var selectedObject = {},
    mongooseId;

  mongooseId = new mongoose.Types.ObjectId();
  selectedObject = new Categories(request.body);
  selectedObject._id = mongooseId;
  selectedObject.save(function(err) {
    if (err) throw err;
  });
  response.send('response: data is seved successfully');
});

// delete category.
router.delete('/api/deleteCategory/:catId', function(request, response) {
  Categories.findByIdAndRemove(request.params.catId, (err, cat) => {
    if (err) return res.status(500).send(err);
  });
  response.send('response: Category successfully deleted');
});

module.exports = router;
