const express = require('express');
const projectDb = require('../data/helpers/projectModel.js');
const actionDb = require('../data/helpers/actionModel.js');

const router = express.Router();

//get all actions
router.get('/', (req, res) => {
	actionDb
		.get()
		.then(actions => {
			res.status(200).json(actions);
		})
		.catch(err => {
			res.json(err);
		});
});

//get specific action
router.get('/:actionid', (req, res) => {
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

//create a new action
router.post('/', (req, res) => {
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

//delete an action by ID
router.delete('/:id', (req, res) => {
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

//Update an action
router.put('/:actionid', (req, res) => {
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

module.exports = router;
