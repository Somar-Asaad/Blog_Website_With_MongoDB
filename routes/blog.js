// module.exports = {
//   connectToDatabase: connect,
//   getDb: getDb
// };

const express = require("express");
const mongoDb = require("mongodb");
const dataBase = require("../data/database");

let db = dataBase;
const objectId = mongoDb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    .find()
    .project({ title: 1, summary: 1, "authors.name": 1 })
    .toArray();

  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

router.post("/new-post", async function (req, res) {
  const authorId = new objectId(req.body.author);
  const currentAuthor = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    date: new Date(),
    content: req.body.content,
    authors: {
      id: authorId,
      name: currentAuthor.name,
      email: currentAuthor.email,
    },
  };
  const result = db.getDb().collection("posts").insertOne(newPost);

  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function (req, res) {
  const postId = new objectId(req.params.id);
  await db.getDb().collection("posts").deleteOne({ _id: postId });
  res.redirect("/posts");
});

router.get("/posts/:id/edit", async function (req, res) {
  const postId = new objectId(req.params.id);
  const currentPost = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: postId });
  res.render("update-post", { post: currentPost });
});
router.post("/posts/:id/edit", async function (req, res) {
  const postId = new objectId(req.params.id);
  await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          content: req.body.content,
        },
      }
    );
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const postId = new objectId(req.params.id);
  const newPost = await db.getDb().collection("posts").findOne({ _id: postId });
  const post = {
    ...newPost,
    humanReadableDate: newPost.date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    isosDate: newPost.date.toISOString(),
  };
  res.render("post-detail", { post: post });
});

module.exports = router;
