'use strict'

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');
const { db: { host, port, name, username, password } } = require('../configs/config.mongodb')

const connectionString = `mongodb://${username}:${password}@${host}:${port}`;

class Database {
    constructor() {
        this.connect();
    }

    // connect
    connect(type = 'mongodb') {
        if (1 === 1) {
            console.log('dbName::', name);
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }

        mongoose.connect(connectionString, {
            maxPoolSize: 50
        })
            .then(_ => {
                countConnect()
                console.log(`Connected MongoDb Success Pro`)
            })
            .catch(err => console.log('Error Connect!'))    
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;