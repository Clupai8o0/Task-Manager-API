const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL, {
	// * task-manager-api is the database name
	useNewUrlParser: true,
	userCreateIndex: true, // indexes are created to allow quick access to data
	userFindAndModify: false,
}); // ? to connect to database
