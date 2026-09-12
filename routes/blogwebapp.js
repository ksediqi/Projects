// routes/blogwebapp.js
const express = require("express");
const router = express.Router();

// In-memory store
let posts = [];
let id = 1;

// List all posts + create a form
router.get("/", (req, res) => {
  res.render("projects/blogwebapp/blog_list", { posts });
});

// Handle new post
router.post("/add", (req, res) => {
  const { title, content } = req.body;
  posts.push({ id: id++, title, content });
  res.redirect("/projects/blogwebapp");
});

// Show edit form
router.get("/edit/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.redirect("/projects/blogwebapp");
  res.render("projects/blogwebapp/blog_edit", { post });
});

// Handle edit submission
router.post("/edit/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (post) {
    post.title = req.body.title;
    post.content = req.body.content;
  }
  res.redirect("/projects/blogwebapp");
});

// Handle delete
router.post("/delete/:id", (req, res) => {
  posts = posts.filter(p => p.id != req.params.id);
  res.redirect("/projects/blogwebapp");
});

module.exports = router;
