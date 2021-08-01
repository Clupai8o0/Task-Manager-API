const express = require("express");
const router = express.Router();
const Task = require("../models/task.js");
const auth = require("../middleware/auth.js");

//? adding a task
router.post("/add/task", auth, async (req, res) => {
	// ? creating a task
	const task = new Task({
		...req.body, // copying all the things in req.body
		owner: req.user._id,
	});

	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

//* GET /tasks?completed=false
//* GET /tasks?limit=2&skip=3
//* GET /tasks?sortBy=createdAt_asc or createdAt:desc
// ? getting all tasks
router.get("/tasks", auth, async (req, res) => {
	const match = {};
	const sort = {};

	if (req.query.completed) {
		//* we get string back
		match.completed = req.query.completed === "true";
	}
	if (req.query.sort) {
		const parts = req.query.sortBy.split(":"); //* separating
		sort[parts[0]] = parts[1] === "desc" ? -1 : 1; //* ternary
	}

	try {
		await req.user
			.populate({
				path: "tasks",
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
				},
				sort,
			})
			.execPopulate();

		res.status(200).send(req.user.tasks); //* populate creates virtual tasks
	} catch (e) {
		res.status(500).send(e);
	}
});

//? getting particular task by id
router.get("/task/:id", auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOne({ _id, owner: req.user._id });
		if (!task) return res.status(404).send("Could not find task");
		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

//? updating a task
router.patch("/update/task/:id", auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["completed", "description"];
	const isValidOperation = updates.every((item) =>
		allowedUpdates.includes(item)
	);
	if (!isValidOperation)
		return res.status(400).send({ error: "Invalid operation..." });

	try {
		const task = await Task.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!task) return res.status(404).send({ error: "Task not found" });

		updates.forEach((update) => (task[update] = req.body[update]));
		await task.save();
		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

//? deleting a task
router.delete("/delete/task/:id", auth, async (req, res) => {
	try {
		const user = await Task.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!user) return res.status(404).send({ error: "task not found" });
		res.status(200).send(user);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
