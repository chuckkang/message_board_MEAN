module.exports = function Route(app, server) {

	var mongoose = require('mongoose');

	mongoose.connect('mongodb://localhost/message_board');
	mongoose.Promise = global.Promise;
	var Schema = mongoose.Schema;

	var PostSchema = new mongoose.Schema({
		name: { type: String, required: true },
		post: { type: String, required: false },
		comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
	})

	var CommentSchema = new mongoose.Schema({
		name: {type: String, required:true},
		comment: {type: String, required:false},
		_post: {type: Schema.Types.ObjectId, ref: 'Message'}
	}, {timestamps:true})

	

	mongoose.model('Comment', CommentSchema);
	var Comment = mongoose.model('Comment');

	mongoose.model('Posts', PostSchema);
	var Post = mongoose.model('Posts')

app.get("/", function(req, res){
	// get all posts
	Post.find({}).populate('comments').exec(function (err, posts) {
		console.log(posts, "This is the posts");
		res.render('index', { posts: posts });
	});

})

app.get("/showsingle/:id", function(req, res){
	Post.findOne({ _id: req.params.id })
		.populate('comments')
		.exec(function (err, posts) {
			console.log(posts, "This is the posts");
			res.render('showsingle', { posts: posts });
		});

})
app.post("/addpost", function (req, res) {
	var posts = Posts({name: req.body.name, post: req.body.post});
	posts.save(function(err){
		if (err){
			console.log("this is the error for the comment add", err)
		}else{
			res.redirect("/")
		}
	})
	
})

app.post("/addcomment/:id", function (req, res) { 
	console.log(req.params.id, "THIS IS THE ID********************")
	Post.findOne({ _id: req.params.id }, function (err, post) {
		// data from form on the front end
		var comm = new Comment(req.body);
		//  set the reference like this:
		comm._post = post._id;
		// now save both to the DB
		comm.save(function (err) {
			post.comments.push(comm);
			post.save(function (err) {
				if (err) {
					console.log('Error');
				} else {
					res.redirect('/');
				}
			});
		});
	});

})
/////////////////////////////////////////////////////////////
}