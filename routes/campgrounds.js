var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: 'dqztppedn', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('errorfirst', err.message);
		console.log(err);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.img = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imgId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
		if (err) {
			req.flash('error', err.message);
			console.log("error" + err);
			console.log("campground" + campground);
			return res.redirect('back');
		}
        res.redirect('/campgrounds/' + campground.id);
      });
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
// router.put("/:id", upload.single('image'), function(req, res){
// 	//find and update the correct campground
// 	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
// 		if (err || !updatedCampground) {
// 			req.flash("error", err.message);
// 			res.redirect("/campgrounds");
// 		} else {
// 			req.flash("success", "Successfully Updated");
// 			res.redirect("/campgrounds/" + req.params.id);
// 		}
// 	});
// 	//redirect 
// });
//UPDATE CAMPGROUND ROUTE
//UPDATE CAMPGROUND ROUTE

router.put("/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imgId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imgId = result.public_id;
                  campground.img = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
			// campground = req.body.campground;
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
	
// DESTROY CAMPGROUND ROUTE

// router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
// 	Campground.findByIdAndRemove(req.params.id, function(err){
// 		if (err) {
// 			res.redirect("/campgrounds");
// 		} else {
// 			res.redirect("/campgrounds");
// 		}
// 	});
// });


router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imgId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});


module.exports = router;
