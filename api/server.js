const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const projectsRouter = require('../projects/projectRouter.js');
const actionsRouter = require('../actions/actionRouter.js');

const server = express();

//configure middleware
server.use(express.json());
server.use(helmet());
server.use(morgan('short'));

//sanity check
server.get('/', (req, res) => {
	res.send(`sanity check success`);
});

//Router API endpoints
server.use('/api/projects', projectsRouter);
server.use('/api/actions', actionsRouter);

//catch all
server.get('/:id', (req, res) => {
	const message = req.params.id;
	res.send(`There is no API endpoint at ${message}`);
});

server.get('/api/:id', (req, res) => {
	const message = req.params.id;
	res.send(`There is no API endpoint at api/${message}`);
});

server.get('/api/:id/:id2', (req, res) => {
	const message = `${req.params.id}/${req.params.id2}`;
	res.send(`There is no API endpoint at api/${message}`);
});

server.get('/api/:id/:id2/:id3', (req, res) => {
	const message = `${req.params.id}/${req.params.id2}/${req.params.id3}`;
	res.send(`There is no API endpoint at api/${message}`);
});

module.exports = server;
