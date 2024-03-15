'use strict'

const mongoose = require('mongoose');

const connectionString = `mongodb://root:Abcd54321@172.16.86.29:27017`;
mongoose.connect( connectionString)
.then(_ => console.log(`Connected MongoDb Success`))
.catch(err => console.log('Error Connect!'))

if (1 === 1) {
    mongoose.set('debug', true)
    mongoose.set('debug', { color: true })
}

module.exports = mongoose