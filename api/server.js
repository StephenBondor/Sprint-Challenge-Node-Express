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

//get all actions
server.get('/api/actions', (req, res) => {
	actionDb
		.get()
		.then(actions => {
			res.status(200).json(actions);
		})
		.catch(err => {
			res.json(err);
		});
});

//get all projects
server.get('/api/projects', (req, res) => {
	projectDb
		.get()
		.then(projects => {
			res.status(200).json(projects);
		})
		.catch(err => {
			res.json(err);
		});
});

//get specific action
server.get('/api/actions/:actionid', (req, res) => {
	const id = req.params.actionid;

	actionDb
		.get(id)
		.then(action => {
			res.status(200).json(action);
		})
		.catch(err =>
			res.status(500).json({
				message: 'Action not found, enter a valid ID'
			})
		);
});

//get specific project
server.get('/api/projects/:projectid', (req, res) => {
	const id = req.params.projectid;
	projectDb
		.get(id)
		.then(project => {
			res.status(200).json(project);
		})
		.catch(err =>
			res.status(404).json({
				message: 'Post not found, enter a valid ID'
			})
		);
});

module.exports = server;
