const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const actionDb = require('../data/helpers/actionModel.js');
const projectDb = require('../data/helpers/projectModel.js');

const server = express();

//configure middleware
server.use(express.json());
server.use(helmet());
server.use(morgan('short'));

//sanity check
server.get('/', (req, res) => {
	res.send(`sanity check success`);
});


module.exports = server;