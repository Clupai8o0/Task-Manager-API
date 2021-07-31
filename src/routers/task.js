const express = require("express");
const router = express.Router();
const Task = require("../models/task.js");

//? adding a task
router.post("/add/task", async (req, res) => {
	// ? creating a task
	const task = new Task(req.body);
	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});
// ? getting all tasks
router.get("/tasks", async (req, res) => {
	try {
		const tasks = await Task.find({});
		if (!tasks) return res.status(500).send("There was an error");

		res.status(200).send(tasks);
	} catch (e) {
		res.status(500).send(e);
	}
});
//? getting particular task
router.get("/task/:id", async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findById(_id);
		if (!task) return res.status(500).send("Could not find task");
		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});
//? updating a task
router.patch("/update/task/:id", async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["completed", "description"];
	const isValidOperation = updates.every((item) =>
		allowedUpdates.includes(item)
	);
	if (!isValidOperation)
		return res.status(400).send({ error: "Invalid operation..." });

	try {
		const task = await Task.findById(req.params.id);
		updates.forEach((update) => (task[update] = req.body[update]));
		await task.save();

		if (!task) return res.status(404).send({ error: "Task not found" });
		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});
//? deleting a task
router.delete("/delete/task/:id", async (req, res) => {
	try {
		const user = await Task.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).send({ error: "task not found" });
		res.status(200).send(user);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
