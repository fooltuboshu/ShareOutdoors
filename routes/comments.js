// ================
// COMMENTS ROUTES
// ================
var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
	//find campgrounds by id 
	Campground.findById(req.params.id, function(err, campground){
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground, currentUser: req.user});
		}
	});
});

//comments created
router.post("/", middleware.isLoggedIn, function(req, res){
	// look up campground using id
	Campground.findById(req.params.id, function(err, campground){
		if (err) {
			console.log(err);
			redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if (err) {
					req.flash("error", "something went wrong");
					console.log(err);
				} else {
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					// console.log()
					req.flash("success", "success added a comment");
					
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});


// edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	if (checkCampgroundId(req, res)) {
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if (err) {
				res.redirect("back");
			} else {
				res.render("comments/edit", {campgroundId: req.params.id, comment: foundComment});
			}
		});
	}
});


//update comment:
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment) {
		if (err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//Comment Destroy Routes

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment delete");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

function checkCampgroundId (req, res) {
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err || !foundCampground) {
			req.flash("error", "Cannot find this outdoor activity");
			res.redirect("back");
			return false;
		}
		return true;
	});
}


module.exports = router;
