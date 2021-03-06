var express 			= require('express'),
	bodyParser 			= require('body-parser'),
	mongoose 			= require('mongoose'),
	methodOverride 		= require('method-override'),
	expressSanitizer 	= require('express-sanitizer'),
	app 				= express();

// APP CONFIG
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost/news_site");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

app.set("view engine", "ejs");

// TODO Add user auth and modify schema

// MONGOOSE/MODEL CONFIG
var articleSchema = new mongoose.Schema(
	{
		title: String,
		image: String,
		content: String,
		author: String,
		category: String,
		like: 
		{
			type: Number,
			default: 0
		},
		dislike: 
		{
			type: Number,
			default: 0
		},
		created: 
		{	
			type: Date,
			default: Date.now
		}
	}
);

var Article = mongoose.model("Article", articleSchema);

// RESTFUL ROUTES

// Index Route
app.get("/articles", function(req, res) {
	Article.find({}, function(err, articles) {
		if (err) {
			console.log(err);
		} else {
			res.render("index", {articles: articles});
		}
	});
});

// Create Route
app.post("/articles", function(req, res) {
	req.body.article.content = req.sanitize(req.body.article.content);

	Article.create(req.body.article, function(err, article) {
		if (err) {
			console.log(err);
			res.render("new");
		} else {
			res.redirect("/articles");
		}
	});
});

// New Route
app.get("/articles/new", function(req, res) {
	res.render("new");
});

// Show Route
app.get("/articles/:id", function(req, res) {
	Article.findById(req.params.id, function(err, article) {
		if (err) {
			console.log(err);
		} else {
			res.render("show", {article: article});
		}
	});
});

// Edit Route
app.get("/articles/:id/edit", function(req, res) {
	Article.findById(req.params.id, function(err, article) {
		if (err) {
			console.log(err);
		} else {
			res.render("edit", {article: article});
		}
	});
});

// Update Route
app.put("/articles/:id", function(req, res) {	
	req.body.article.content = req.sanitize(req.body.article.content);

	Article.findByIdAndUpdate(req.params.id, req.body.article, function(err, article) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/articles/" + req.params.id);
		}
	});
});

app.put("/articles/:id/like", function(req, res) {
	Article.findByIdAndUpdate(req.params.id, {$inc: {like: 1}},function(err, article) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/articles/" + req.params.id);
		}
	});
});

app.put("/articles/:id/dislike", function(req, res) {
	Article.findByIdAndUpdate(req.params.id, {$inc: {like: -1}},function(err, article) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/articles/" + req.params.id);
		}
	});
});

// Delete Route
app.delete("/articles/:id", function(req, res) {
	Article.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/articles");
		}
	});
});

// Root Route
app.get("/", function(req, res) {
	res.redirect("/articles");
});

app.listen(3000, function() {
	console.log("Server started on port 3000.");
});
