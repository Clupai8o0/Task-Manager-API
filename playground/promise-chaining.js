require("../src/db/mongoose.js");
const User = require("../src/models/user.js");

id = "60fc01dda46fe4433838a03b";

// mongoose takes care of $set
// User.findByIdAndUpdate(id, { age: 1 })
// 	.then((user) => {
// 		console.log(user);
// 		return User.countDocuments({ age: 1 });
// 	})
// 	.then((result) => {
// 		console.log(result);
// 	})
// 	.catch((e) => {
// 		console.log(e);
// 	});

const updateAgeAndCount = async (id, age) => {
	const user = await User.findByIdAndUpdate(id, { age });
	const count = await User.countDocuments({ age });
	return count;
};

updateAgeAndCount(id, 2).then(console.log).catch(console.log);
