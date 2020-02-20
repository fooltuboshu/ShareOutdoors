var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
// Index show all campgrounds

router.get("/", function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if (err || !allCampgrounds) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
	
});

// Create -- Add new campground to database
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form and add to campgrounds array
	// redirect back to campgrounds
	var name = req.body.name;
	var img = req.body.img
	var price = req.body.price;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name:name, img:img, description: description, author: author, price: price};
	Campground.create(newCampground, function(err, newCreated){
		if (err || !newCreated) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});


//New -- Show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new.ejs" , {currentUser: req.user});
});


router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){ 
		if (err || !foundCampground) {
			req.flash("error", "Cannot find the Campground");
			res.redirect("back");
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err || !foundCampground) {
			req.flash("error", "Cannot find the Campground");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/edit", {campground: foundCampground});
	});
	
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if (err || !updatedCampground) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	//redirect 
});

// DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});


//middleware

module.exports = router;
