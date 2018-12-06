var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer');

// sending email
router.post('/api/sendEmail', function(request, response) {
  var message = '';

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: request.body.email,
      pass: request.body.password
    }
  });

  var mailOptions = {
    to: 'info@repolus.com',
    // to: '',
    subject: request.body.subject,
    // text: request.body.subject, // plain text body\
    html:
      'Hi, <br> Repolus <br><br>' +
      request.body.comment +
      '<br><br>Thanks,<br>' +
      request.body.name +
      '.'
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      message = 'email not send';
      return response.status(500).send(error);
    }

    message = 'Message is sended successfully to Repolus Management.';
    response.json(message);
  });
});

module.exports = router;
