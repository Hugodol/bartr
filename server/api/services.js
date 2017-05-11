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
  console.log('location', provided_lat, provided_lng)
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

  db.Service.findAll({ where: { id: req.params.services}})
    .then((service) => {
      return db.User.findAll({ where: { service_id: service[0].dataValues.id}})
        .then((users) => {
          return Promise.all(
            users.map((person, i) => {
              personName[i] = person.name;
              return db.Review.findAll({ where: { sender_id: person.id}})
                .then((reviews) => {
                  if(reviews.length > 0){
                    let avg = reviews.map((num) => num.score).reduce((acc, index) => acc + index, 0)/reviews.length;
                    reviewsAverage[0].push(avg);
                    let newObj = {};
                    !newObj.hasOwnProperty(personName[i]) ? newObj[personName[i]] = avg : null;
                    reviewsAverage[1].push(newObj);
                    let bestRated = reviewsAverage[0].sort().reverse()[0];
                    return reviewsAverage[1].map((provider) => {
                      for(let key in provider){
                        if(provider[key] === bestRated){
                          console.log("Person providing Service: ", provider);
                          return provider;
                        }
                      }
                    });
                  }
                });
              })
          );
        })
        .then((data) => {
          //an array of promises
          if(data.length > 0){
            data = (data[1] === undefined) ? data.filter((item) => item !== undefined) : data.map((item) => item.filter((thing) => thing !== undefined));
            data = [].concat.apply([], data);
            data = data.filter((el, i, arr) => arr.indexOf(el) === i);
            data = data.length > 2 ? data.slice(0, 2) : data;
            console.log("Getting the Users with their avg rating scores", data);
            res.status(200).send(data);
          }
        })
        .catch((error) => {
          console.log("Too much crazy stuff going on do better: ", error);
          res.status(404).send(error);
        });
    })
});


module.exports = router;
