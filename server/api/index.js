const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/engagements', require('./engagements'));
router.use('/messages', require('./messages'));
router.use('/services', require('./services'));
router.use('/reviews', require('./reviews'));
router.use('/transactions', require('./transactions'));

//Send Email When Financial Data Transactions Occur
router.use('/emails', require('./emails'));


module.exports = router;
