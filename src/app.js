require('dotenv').config();

const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// init database
require('./dbs/init.mongodb.singleton');
// const initRedis = require('./dbs/init.redis');
// initRedis.initRedis();  

// test pub.sub redis
// require('./tests/inventory.test');
// const productTest = require('./tests/product.test');
// productTest.purchaseProduct('product:001', 10);

// const { checkOverload } = require('./helpers/check.connect');
// checkOverload()

// init server
app.use('', require('./routers'));

// handling error
app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
})

module.exports = app;