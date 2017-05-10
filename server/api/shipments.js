// 'use strict';
// const Sequelize = require('sequelize');
// const User = require('../db').User;
// const Shipment = require('../db').Shipment;
// var Parcel = require('../db').Parcel;
// const router = require('express').Router();
// const findAuth0User = require('./util').findAuth0User;
// var shippo = require('shippo')(process.env.SHIPPO_API_TEST_TOKEN);


// router.get('/trades', (req, res, next) => {
//   Shipment.findAll({
//     where: {$or: [{sender_id: req.params.id, receiver_id: req.params.id}]}
//   })
//   .then((shipment) => {
//     console.log('Shipment GET Request Successful: ', JSON.parse(shipment));
//     res.status(200).send(JSON.parse(shipment));
//   })
//   .catch((error) => {
//     console.log(`Coudn't get Shipment with id of ${req.params.id} because: ${error}`);
//     res.status(404).send();
//   })
// });


// router.post('/create-trades', (req, res, next) => {
//   Shipment.findOne({
//     where: {
//       address_to: req.body.address_to,
//       address_from: req.body.address_from,
//       shipment_data: req.body.shipment_data,
//       metadata: req.body.metadata
//     }
//   })
//   .then((shipment) => {
//     if(shipment){
//       console.log("That shipment has already gone through.", JSON.stringify(shipment));
//       res.status(404).send('That shipment has already gone through');
//     } else {
//       shippo.address.create({

//       })




//       let tempObject = [];
//       req.body.parcels.forEach((parcls) => {
//         tempObject.push(parcls);
//       });
//       Parcel.bulkCreate({tempObject})
//       .then((parcells) => {
//         Shipment.create({
//           status: req.body.status,
//           address_to: req.body.address_to,
//           address_from: req.body.address_from,
//           packages: parcells,
//           shipment_data: req.body.shipment_data,
//           metadata: req.body.metadata
//         })
//         .then((item) => {
//           res.status(201).send(item);
//         });
//       });
//     }
//   });
// })
