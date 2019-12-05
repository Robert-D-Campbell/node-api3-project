const express = require("express");
const helmet = require("helmet");

const Users = require("./userDb");
const Posts = require("../posts/postDb");

const router = express.Router();

router.use(express.json());
router.use(helmet());

router.post("/", validateUser, (req, res) => {
  // do your magic!
  Users.insert(req.body)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(err => {
      // log error to database
      console.log(err);
      res.status(500).json({
        message: "Error adding the User"
      });
    });
});

router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
  // do your magic!
  Posts.insert(req.body)
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      // log error to database
      console.log(err);
      res.status(500).json({
        message: "Error adding the post"
      });
    });
});

router.get("/", validateUser, (req, res) => {
  // do your magic!
  Users.get(req.query)
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "The users could not be retrieved." });
    });
});

router.get("/:id", validateUserId, (req, res) => {
  const id = req.params.id;
  // do your magic!
  Users.getById(id)
    .then(user => {
      res.status(200).json(req.user);
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ error: "The user information could not be retrieved." });
    });
});

router.get("/:id/posts", validateUserId, (req, res) => {
  // do your magic!
  const id = req.params.id;
  if (!id) {
    res.status(404).json({
      message: "The posts with the specified  user ID does not exist."
    });
  }
  Users.getUserPosts(id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ errorMessage: "error geting users posts" });
    });
});

router.delete("/:id", validateUserId, (req, res) => {
  id = req.params.id;
  if (!id) {
    res.status(404).json({
      message: "The posts with the specified  user ID does not exist."
    });
  } else {
    Users.remove(id)
      .then(removed => {
        res
          .status(200)
          .json({ message: "The user has been sacrificed to the API GODS!" });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ errorMessage: "error geting users posts" });
      });
  }
});

router.put("/:id", validateUser, (req, res) => {
  // do your magic!
  const id = req.params.id;
  const changes = req.body;

  if (!id) {
    res
      .status(404)
      .json({ message: "The user with the specified ID does not exist." });
  } else {
    Users.update(id, changes)
      .then(post => {
        res.status(200).json(changes);
      })
      .catch(err => {
        console.log("error on PUT /api/users/:id", err);
        res
          .status(500)
          .json({ errorMessage: "error adding the user to the database" });
      });
  }
});

//custom middleware

function validateUserId(req, res, next) {
  const id = req.params.id;
  Users.getById(id)
    .then(user => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(404).json({ message: "invalid user id" });
      }
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ error: "The user information could not be retrieved." });
    });
}
function validateUser(req, res, next) {
  const body = req.body;
  console.log(req.body);
  if (!body) {
    res.status(400).json({ message: "missing user data" });
  } else if (!body.name) {
    res.status(400).json({ message: "missing required name field" });
  } else {
    next();
  }
}
function validatePost(req, res, next) {
  const body = req.body;
  console.log(req.body);
  if (!body) {
    res.status(400).json({ message: "missing post data" });
  } else if (!body.text) {
    res.status(400).json({ message: "missing required text field" });
  } else if (!body.user_id) {
    res.status(400).json({ message: "missing required user_id field" });
  } else {
    next();
  }
}

module.exports = router;
