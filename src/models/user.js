const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	age: {
		type: Number,
		validate: (value) => {
			if (value < 0) throw new Error("Age must be a positive number!");
		},
		default: 0,
	},
	email: {
		type: String, //* makes sure that a email is not reused
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) throw new Error("Email is invalid");
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate: (value) => {
			if (value.toLowerCase().includes("password"))
				throw new Error("Password cannot be 'password'");
		},
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

//* functions
userSchema.virtual("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "owner",
});

//? making login more secure
userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject(); //* raw profile data

	delete userObject.password;
	delete userObject.tokens;
	return userObject;
};

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, "ThisIsNodeCourse");

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

//* making a new function
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) throw new Error("Unable to log in.");

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw new Error("Unable to log in.");

	return user;
};

// * hash the password before saving
userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next(); // to make the code continue
}); // post(name of event, function to run)

//* delete user task when user is deleted
userSchema.pre("remove", async function (next) {
	const user = this;
	await Task.deleteMany({ owner: user._id });
	next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
