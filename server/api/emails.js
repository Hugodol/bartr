'use strict';

const router = require('express').Router();
const nodemailer = require('nodemailer');
const findAuth0User = require('./util').findAuth0User;


router.post('/send', function(req, res, next){
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD
    }
  });

  let mailOptions = {
    from: 'Bartr © ' + new Date.getFullYear(),
    to: req.body.email,
    subject: "Recent Transaction Data",
    text: "Recent Transaction Data In BitCoin Wallet For " req.body.name + ".\nYou're current BTC amount is: " + req.body.btcAmount + ". Which is $" + req.body.dollarAmount + ".",
    html: "<h1>Hello " + req.body.name + ", thanks for bartering with us! We value our users and pride ourselves on keeping your actions up to date with our 24/7 platform support specialists.</h1><br/><p>There has been a recent transaction on your account and you currently posses <b>" + req.body.btcAmount + " BTC</b></p><br/><p style="color: red">If there are any concerns of suspicous activity call the police... It's none of our concern :P</p>"
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log("COULDN'T SEND MESSAGE: ", error);
    } else {
      console.log("Message Sent: " + info.response);
    }
  });
  console.log("Test to see if we're getting into the nodemailer function");
});


module.exports = router;
