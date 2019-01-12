const express = require('express');
const projectDb = require('../data/helpers/projectModel.js');

const router = express.Router();

//get all projects
router.get('/', (req, res) => {
	projectDb
		.get()
		.then(projects => {
			res.status(200).json(projects);
		})
		.catch(err => {
			res.json(err);
		});
});

//get specific project
router.get('/:projectid', (req, res) => {
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
router.post('/', (req, res) => {
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

//delete a project by ID
router.delete('/:id', (req, res) => {
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

//get all actions for a project
router.get('/:projectid/actions', (req, res) => {
	const id = req.params.projectid;
	projectDb
		.getProjectActions(id)
		.then(actions => {
			if (actions.length != 0) {
				res.status(200).json(actions);
			} else {
				res.status(404).json({
					message:
						'Either the Project has no actions or there was an invalid ID'
				});
			}
		})
		.catch(err => res.status(500).json(err));
});

//Update a project
router.put('/:projectid', (req, res) => {
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

module.exports = router;
