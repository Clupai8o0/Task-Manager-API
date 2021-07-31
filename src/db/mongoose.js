const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
	// * task-manager-api is the database name
	useNewUrlParser: true,
	userCreateIndex: true, // indexes are created to allow quick access to data
	userFindAndModify: false,
}); // ? to connect to database
