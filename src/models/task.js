const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const taskSchema = new mongoose.Schema({
	description: {
		type: String,
		trim: true,
		required: true,
	},
	completed: {
		type: Boolean,
		default: false,
	},
});

const Tasks = mongoose.model("Tasks", taskSchema);

module.exports = Tasks;
