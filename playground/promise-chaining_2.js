require("../src/db/mongoose.js");
const Task = require("../src/models/task.js");

Task.findByIdAndDelete("60fc0eb48761854fb40dc4e4")
	.then((task) => {
		console.log(task);
		return Task.countDocuments({ completed: false });
	})
	.then(console.log)
	.catch(console.log);

const deleteTaskAndCount = async (id) => {
	const task = await Task.findByIdAndDelete(id);
	const count = await Task.countDocuments({ completed: false });
	return count;
};
deleteTaskAndCount("60fc0eb48761854fb40dc4e4")
	.then(console.log)
	.catch(console.log);
