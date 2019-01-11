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
				message: 'Project not found, enter a valid ID'
			})
		);
});

//create a new project
server.post('/api/projects', (req, res) => {
	const projectInfo = req.body;

	//check the name of the project
	if (!projectInfo.name || projectInfo.name.length > 128) {
		res.status(400).json({
			errorMessage:
				'Please provide a valid name for the project (<128 chars).'
		});
	}

	//check to see if the object has a description
	else if (!projectInfo.description) {
		res.status(400).json({
			errorMessage: 'Please provide a valid description for the project.'
		});
	}

	//check to see that the rest of the object is formatted correctly
	else if (Object.keys(projectInfo).length != 2) {
		res.status(400).json({
			errorMessage:
				"Please provide a valid object for the project: { name : 'Bob Dole', description: 'I am running for president' }"
		});
	}

	//check to see if that name is taken already
	else {
		projectDb
			.get()
			.then(projects => {
				if (
					projects
						.map(project => project.name)
						.includes(projectInfo.name)
				) {
					res.status(400).json({
						errorMessage:
							'Please provide a unique name for the project.'
					});
				} else {
					//actually add the new project
					projectDb
						.insert(projectInfo)
						.then(result => {
							res.status(201).json(result);
						})
						.catch(err =>
							res.status(500).json({
								message: 'Adding the project failed'
							})
						);
				}
			})
			.catch(err => res.status(500).json(err));
	}
});

//create a new action
server.post('/api/actions', (req, res) => {
	const actionInfo = req.body;

	//check the description of the action
	if (!actionInfo.description || actionInfo.description.length > 128) {
		res.status(400).json({
			errorMessage:
				'Please provide a valid description for the action (<128 chars).'
		});
	}

	//check to see if the object has a notes
	else if (!actionInfo.notes) {
		res.status(400).json({
			errorMessage: 'Please provide valid notes for the action.'
		});
	}

	//check to see if the object has a project_id
	else if (!actionInfo.project_id) {
		res.status(400).json({
			errorMessage: 'Please provide valid project_id for the action.'
		});
	}

	//check to see that the rest of the object is formatted correctly
	else if (Object.keys(actionInfo).length != 3) {
		res.status(400).json({
			errorMessage:
				"Please provide a valid object for the action: { project_id : 1, description: 'Win', notes : 'Win everything' }"
		});
	}

	//check to see if the action description is taken already for this task
	else {
		actionDb
			.get()
			.then(actions => {
				if (
					actions
						.filter(
							action =>
								action.project_id === actionInfo.project_id
						)
						.map(action => action.description)
						.includes(actionInfo.description)
				) {
					res.status(400).json({
						errorMessage:
							'Please provide a unique description for the action.'
					});
				} else {
					//check to see if it is a valid project_id
					projectDb
						.get()
						.then(projects => {
							if (
								projects
									.map(project => project.id)
									.includes(actionInfo.project_id)
							) {
								//actually add the new action
								actionDb
									.insert(actionInfo)
									.then(result => {
										res.status(201).json(result);
									})
									.catch(err =>
										res.status(500).json({
											message: 'Adding the action failed'
										})
									);
							} else {
								res.status(400).json({
									errorMessage:
										'Please provide a valid project_id for the action.'
								});
							}
						})
						.catch(err => res.status(500).json(err));
				}
			})
			.catch(err => res.status(500).json(err));
	}
});

//delete a project by ID
server.delete('/api/projects/:id', (req, res) => {
	const id = req.params.id;
	projectDb
		.remove(id)
		.then(count => {
			if (count) {
				res.status(200).json(count);
			} else {
				res.status(404).json({
					message: 'The project with the specified ID does not exist'
				});
			}
		})
		.catch(err => res.status(500).json(err));
});

//delete an action by ID
server.delete('/api/actions/:id', (req, res) => {
	const id = req.params.id;
	actionDb
		.remove(id)
		.then(count => {
			if (count) {
				res.status(200).json(count);
			} else {
				res.status(404).json({
					message: 'The action with the specified ID does not exist'
				});
			}
		})
		.catch(err => res.status(500).json(err));
});

//Update a project
server.put('/api/projects/:projectid', (req, res) => {
	const projectInfo = req.body;
	const id = req.params.projectid;

	//check the name of the project
	if (!projectInfo.name || projectInfo.name.length > 128) {
		res.status(400).json({
			errorMessage:
				'Please provide a valid name for the project you are updating (<128 chars).'
		});
	}

	//check to see if the object has a description
	else if (!projectInfo.description) {
		res.status(400).json({
			errorMessage: 'Please provide a valid description for the project.'
		});
	}

	//check to see if the object has a completed key
	else if (!Object.keys(projectInfo).includes('completed')) {
		res.status(400).json({
			errorMessage:
				'Please provide a valid completed key for the project object.'
		});
	}

	//check to see that the rest of the object is formatted correctly
	else if (Object.keys(projectInfo).length != 3) {
		res.status(400).json({
			errorMessage:
				"Please provide a valid object for the project: { name : 'Bob Dole', description: 'I am running for president', completed: true }"
		});
	}

	//check to see if that name is taken already
	else {
		projectDb
			.get()
			.then(projects => {
				if (
					projects
						.filter(project => project.id != id)
						.map(project => project.name)
						.includes(projectInfo.name)
				) {
					res.status(400).json({
						errorMessage:
							'Please provide a unique name for the project.'
					});
				} else {
					//actually update the project
					projectDb
						.update(id, projectInfo)
						.then(result => {
							if (result) {
								res.status(201).json(result);
							} else {
								res.status(400).json({
									message: 'Please provide a valid project ID'
								});
							}
						})
						.catch(err => res.status(500).json(err));
				}
			})
			.catch(err => res.status(500).json(err));
	}
});

//Update an action
server.put('/api/actions/:actionid', (req, res) => {
	const actionInfo = req.body;
	const id = req.params.actionid;

	//check the description of the action
	if (!actionInfo.description || actionInfo.description.length > 128) {
		res.status(400).json({
			errorMessage:
				'Please provide a valid description for the action (<128 chars).'
		});
	}

	//check to see if the object has a notes
	else if (!actionInfo.notes) {
		res.status(400).json({
			errorMessage: 'Please provide valid notes for the action.'
		});
	}

	//check to see if the object has a project_id
	else if (!actionInfo.project_id) {
		res.status(400).json({
			errorMessage: 'Please provide valid project_id for the action.'
		});
	}

	//check to see if the object has a completed key
	else if (!Object.keys(actionInfo).includes('completed')) {
		res.status(400).json({
			errorMessage:
				'Please provide a valid completed key for the action object.'
		});
	}

	//check to see that the rest of the object is formatted correctly
	else if (Object.keys(actionInfo).length != 4) {
		res.status(400).json({
			errorMessage:
				"Please provide a valid object for the action: { project_id : 1, description: 'Win', notes : 'Win everything', completed : true }"
		});
	}

	//check to see if the action description is taken already for this task
	else {
		actionDb
			.get()
			.then(actions => {
				if (
					actions
						.filter(
							action =>
								action.project_id === actionInfo.project_id &&
								action.id != id
						)
						.map(action => action.description)
						.includes(actionInfo.description)
				) {
					res.status(400).json({
						errorMessage:
							'Please provide a unique description for the action.'
					});
				} else {
					//check to see if it is a valid project_id
					projectDb
						.get()
						.then(projects => {
							console.log(projects);
							if (
								projects
									.map(project => project.id)
									.includes(actionInfo.project_id)
							) {
								//actually update the new action
								actionDb
									.update(id, actionInfo)
									.then(result => {
										if (result) {
											res.status(201).json(result);
										} else {
											res.status(400).json({
												message:
													'Please provide a valid action ID'
											});
										}
									})
									.catch(err => res.status(500).json(err));
							} else {
								res.status(400).json({
									errorMessage:
										'Please provide a valid project_id for the action.'
								});
							}
						})
						.catch(err => res.status(500).json(err));
				}
			})
			.catch(err => res.status(500).json(err));
	}
});

//get all actions for a project
server.get('/api/projects/:projectid/actions', (req, res) => {
	const id = req.params.projectid;
	projectDb
		.getProjectActions(id)
		.then(actions => {
			if (actions.length != 0) {
				res.status(200).json(actions);
			} else {
				res.status(404).json({
					message: 'Either the Project has no actions or there was an invalid ID'
				});
			}
		})
		.catch(err => res.status(500).json(err));
});

//catch all
server.get('/:id', (req, res) => {
	const message = req.params.id;
	res.send(`There is no API endpoint at ${message}`);
});

server.get('/api/:id', (req, res) => {
	const message = req.params.id;
	res.send(`There is no API endpoint at api/${message}`);
});

module.exports = server;
