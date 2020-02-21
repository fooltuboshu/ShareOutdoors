// ===============
// AUTH ROUTES
// ===============

// show register form

var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route

router.get("/", function(req, res){
	res.render("landing");
});

router.get("/register", function(req, res){
	res.render("register");
});

router.post("/register", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if (err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("register");
		} else {
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "Welcom to ShareOutdoors " + user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

// show login form

router.get("/login", function(req, res){
	res.render("login");
});

router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(res, req){
});


//logic logout
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "logged out");
	res.redirect("/campgrounds");
});

module.exports = router;

