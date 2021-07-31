const express = require("express");
const router = new express.Router();
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");

// ? getting users profile
router.get("/user/me", auth, async (req, res) => {
	res.send(req.user);
});

// ! login
router.post("/users/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findByCredentials(email, password);
		const token = await user.generateAuthToken();
		res.send({
			user,
			token,
		});
	} catch (e) {
		res.status(400).send();
	}
});

//! logout
router.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});
router.post("/users/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send("Successfully logged out of all devices");
	} catch (e) {
		res.status(500).send(e);
	}
});

//? Getting a particular user using ID
router.get("/user/:id", async (req, res) => {
	const _id = req.params.id; // getting the id
	try {
		const user = await User.findById(_id);
		if (!user) return res.status(404).send("User not found");

		res.status(200).send(user);
	} catch (e) {
		res.status(500).send(e);
	}
}); // "/users/1234"

//? adding a user
router.post("/add/user", async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).send({
			user,
			token,
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

//? updating user
router.patch("/update/user/:id", async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["name", "email", "password"];
	const isValidOperation = updates.every((item) => {
		return allowedUpdates.includes(item);
	}); //! 10 trues returns trues, but 9 trues and 1 false returns false
	if (!isValidOperation) {
		return res.status(400).send({ error: "Invalid operation..." });
	}

	try {
		const user = await User.findById(req.params.id);
		updates.forEach((update) => (user[update] = req.body[update])); // dynamic
		await user.save();

		if (!user) return res.status(404).send("User not found");
		res.status(200).send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

//? deleting user
router.delete("/delete/user/:id", async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).send({ error: "User not found" });
		res.status(200).send(user);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
