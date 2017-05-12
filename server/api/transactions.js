'use strict';

const router = require('express').Router();
const easyBtc = require('easy-bitcoin-js');
const request = require('request');
const axios = require('axios');

const $ = require('jquery');

router.post('/create', (req, res) => {
  if(req.body.hasOwnProperty("fromWIF") && req.body.hasOwnProperty("toAddress")) {
    easyBtc.getWallet(req.body.public_key).then(walletInfo => {
      console.log("FROM WIF:" + req.body.fromWIF);
      console.log("tx: " + walletInfo.txs[0].hash);
      // console.log("to:" + req.body.toAddress);
      console.log("RAW FINAL BALANCE IN SATOSHIS", walletInfo.final_balance)
      // console.log("FINAL BALANCE CONVERSION", walletInfo.final_balance / Math.pow(10, 2));
      // let value = Number(Math.floor(walletInfo.final_balance / Math.pow(10, 2)));
      // console.log("VALUE IS", value);
      let hash = easyBtc.newTransaction(req.body.fromWIF, walletInfo.txs[0].hash, req.body.toAddress, walletInfo.final_balance - 25);
      console.log("HASH IS", hash.hex);
      // const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      // axios.post('https://blockchain.info/pushtx', {tx: hash.hex.serialize()}).then(data => {
      //     console.log(data);
      // })

      easyBtc.pushTransaction(hash.hex).then(data => {
        console.log("DATA AFTER PUSH IS", data);
      })
    });
  }
    res.status(200);
    res.send();  
});

router.get('/transactions', (req, res) => {
  console.log("HELLO");
//   easyBtc.getAddress(req.public_key).then(walletInfo => {
//     let hash = easyBtc.newTransaction(req.fromWIF, walletInfo.txs[0].hash, req.toAddress, walletInfo.final_balance);
//     console.log("HASH IS", hash);
//     res.status(200);
//   })
    req.end();
});

module.exports = router;
