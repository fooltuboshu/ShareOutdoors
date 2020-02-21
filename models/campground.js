var mongoose = require("mongoose");
// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
	name: String,
	img: String,
	imgId: String,
	price: String,
	description: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Campground", campgroundSchema);

