'use strict'

// level 0
// const config = {
//     app: {
//         port: 3000
//     },
//     db: {
//         host: '172.16.86.29',
//         port: 27017,
//         name: 'db',
//         username: 'root',
//         password: 'Abcd54321'
//     }
// }

// level 1
// const dev = {
//     app: {
//         port: process.env.DEV_APP_PORT
//     },
//     db: {
//         host: '172.16.86.29',
//         port: 27017,
//         name: 'db',
//         username: 'root',
//         password: 'Abcd54321'
//     }
// }

// const prod = {
//     app: {
//         port: 3000
//     },
//     db: {
//         host: '172.16.86.29',
//         port: 27017,
//         name: 'db',
//         username: 'root',
//         password: 'Abcd54321'
//     }
// }

// level 2
const dev = {
    app: {
        port: process.env.DEV_APP_PORT
    },
    db: {
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        name: process.env.DEV_DB_NAME,
        username: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD
    }
}

const prod = {
    app: {
        port: process.env.PRO_APP_PORT
    },
    db: {
        host: process.env.PRO_DB_HOST,
        port: process.env.PRO_DB_PORT,
        name: process.env.PRO_DB_NAME,
        username: process.env.PRO_DB_USERNAME,
        password: process.env.PRO_DB_PASSWORD
    }
}

// level 0
// module.exports = config;

// level 1, 2
const config = { dev, prod };
const env = process.env.NODE_ENV || 'dev';
module.exports = config[env];