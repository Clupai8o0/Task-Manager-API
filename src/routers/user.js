const express = require("express");
const router = new express.Router();
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");

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
		res.send({ user, token });
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

//? adding a user
router.post("/add/user", async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({
			user,
			token,
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

//? user pfp
const upload = multer({
	//? when dest is removed the file is returned
	limits: {
		fileSize: 1000000, //* it works on the basis of bytes. 1,000,000 bytes is 1mb
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|png|jpeg)$/))
			return cb(new Error("File must be of the format jpg or png"));
		cb(undefined, true);
	},
});
router.post(
	"/users/me/avatar",
	auth,
	upload.single("avatar"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer(); //* conversions
		req.user.avatar = buffer; //* setting the avatar
		await req.user.save();
		res.status(200).send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);
router.delete("/delete/users/me/avatar", auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.status(200).send();
});
router.get("/users/:id/avatar", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user || !user.avatar) throw new Error();

		res.set("Content-Type", "image/png");
		res.send(user.avatar);
	} catch (e) {
		res.status(404).send();
	}
});

//? updating user
router.patch("/update/user/me", auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["name", "email", "password"];
	const isValidOperation = updates.every((item) => {
		return allowedUpdates.includes(item);
	}); //! 10 trues returns trues, but 9 trues and 1 false returns false
	if (!isValidOperation) {
		return res.status(400).send({ error: "Invalid operation..." });
	}

	try {
		updates.forEach((update) => (req.user[update] = req.body[update])); // dynamic
		await req.user.save();
		res.send(req.user);
	} catch (e) {
		res.status(400).send(e);
	}
});

//? deleting user
router.delete("/delete/user/me", auth, async (req, res) => {
	try {
		sendCancelEmail(req.user.email, req.user.name);
		await req.user.remove();
		res.send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
