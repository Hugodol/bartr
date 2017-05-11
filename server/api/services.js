'use strict';

const Sequelize = require('sequelize');
const db = require('../db');
const router = require('express').Router();

const getBoundingBox = require('./util').getBoundingBox;

router.get('/', (req, res) => {
  db.Service.findAll()
    .then((result)=>{
      res.json(result)
    })
});

router.get('/find', (req, res) => {
  let provided_lng = Number(req.query.lng);
  let provided_lat = Number(req.query.lat);
  let requested_services = req.query.services;
  let provided_distance = req.query.distance;
  let boundingBox = getBoundingBox([provided_lat, provided_lng], provided_distance)
  console.log('location', provided_lat, provided_log)
  console.log('box', boundingBox)
  let buildWhere = {};
  if (requested_services){
    buildWhere = {id: requested_services}
  }
    db.User.findAll({
      where: {
        geo_lng: {$gte: boundingBox[0], $lte: boundingBox[2]},
        geo_lat: {$gte: boundingBox[1], $lte: boundingBox[3]}
      },
      include: [
        {
        model: db.Service,
        where: buildWhere
        },
        // {
        //   model: db.Review,
        //   as: 'received_reviews',
        //   attributes: ['score']
        // }
      ],
      // attributes: Object.keys(db.User.attributes).concat([[Sequelize.fn('AVG', Sequelize.col('received_reviews.score')), 'avgscore']]),
      // group:['user.id']
    })
      .then((results)=>{
        res.json(results)
      })
});

router.post('/', (req, res, next) => {
  db.Service.findOne({
    where:{
      type: req.body.type
    }
  })
    .then(data => {
      if(!data) {
        db.Service.create({
          type: req.body.type
        })
          .then(data => {
            res.status(201).send(data);
            console.log('POST REQ for Services successful: ', data);
          })
          .catch(next);
      }
    })
    .catch(next);
})


router.get('/:services', (req, res, next) => {
  let reviewsAverage = [[], []];
  let resultData = [];
  let personName = [];

  db.Service.findAll({ where: { id: req.params.services}, limit: 1})
    .then((service) => {
      console.log("In The Find All Services Functon: ", service);
      db.User.findAll({ where: { service_id: service[0].id}})
        .then((users) => {
          console.log("In the Find All Users Who Provide a Type of Service Function: ", users);
          users.forEach((person, i) => {
            personName[i] = person.name;
            console.log("Each Persons Id: ", person.id);
            console.log("Each Persons Name: ", person.name);
            db.Review.findAll({ where: { sender_id: person.id}})
              .then((reviews) => {
                if(reviews.length > 0){
                  console.log("In the Find All Reviews of Users of a Particular Users Services Function... " + " User: " + personName[i], reviews);
                  let avg = reviews.map((num) => num.score).reduce((acc, index) => acc + index, 0)/reviews.length;
                  reviewsAverage[0].push(avg);
                  console.log("" + personName[i] + "'s avg rating is: ", avg);
                  let newObj = {};
                  newObj[personName[i]] = avg;
                  reviewsAverage[1].push(newObj);
                  console.log("The REVIEWS AVERAGE SCORES FOR " + personName[i] + " IS: ", reviewsAverage);
                  let bestRated = reviewsAverage[0].sort().reverse();
                  console.log("THE BEST RATED FOR " + personName[i] + " IS: ", bestRated);
                  bestRated = [bestRated[0]];
                  console.log("Highest Rated Avg Scores Are: ", bestRated);
                  reviewsAverage[1].map((data) => {
                    for(let key in data){
                      if(data[key] === bestRated[0]){
                        resultData.push(data);
                      }
                    }
                  });
                console.log("Result Data So Far: ", resultData);
                }
              });
          });
        });
    });
    if(resultData.length > 0){
      res.status(200).send(resultData);
    } else {
      res.status(404).send("Coudn't get Highest Rated Service Providers Due To Async Issues... Probably...");
    }
});


module.exports = router;
