'use strict';

const router = require('express').Router();
const easyBtc = require('easy-bitcoin-js');
const axios = require('axios');
var bitcoin = require("bitcoinjs-lib");
var bigi    = require("bigi");
var buffer  = require('buffer');
var cs = require('coinstring');


router.post('/create', (req, res) => {
  if(req.body.hasOwnProperty("fromWIF") && req.body.hasOwnProperty("toAddress")) {
    easyBtc.getWallet(req.body.public_key).then(walletInfo => {
      console.log("FROM WIF:" + req.body.fromWIF);
      console.log("to:" + req.body.toAddress);
      console.log("RAW FINAL BALANCE IN SATOSHIS", walletInfo.final_balance)
      console.log("PUBLIC KEY IS", req.body.public_key);
      var newtx = {
        inputs: [{addresses: [req.body.public_key]}],
        outputs: [{addresses: [req.body.toAddress], value: Math.floor(walletInfo.final_balance - 75000) }]
      };

      console.log("NEW TX STRINGIFIED", JSON.stringify(newtx));
      axios.post('https://api.blockcypher.com/v1/btc/main/txs/new', newtx)
         .then(function(updatedtx) {
            console.log("UPDATED TX IS", updatedtx);
            updatedtx = updatedtx.data;

            var keys = bitcoin.ECPair.fromWIF(req.body.fromWIF);
            console.log("KEYS ARE ", keys);
            updatedtx.pubkeys = [];
            updatedtx.signatures = updatedtx.tosign.map(function(tosign, n) {
              updatedtx.pubkeys.push(keys.getPublicKeyBuffer().toString("hex"));
              return keys.sign(new buffer.Buffer(tosign, "hex")).toDER().toString("hex");
            });

            updatedtx.preference = "high";
            axios.post('https://api.blockcypher.com/v1/btc/main/txs/send', updatedtx).then(function(finaltx) {
              console.log("FASTER FINAL TRANSACTION", finaltx);
            })
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
