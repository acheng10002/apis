const express = require("express");

const router = express.Router();

/* I can operate on user resource, which is a REST resource 
transforms the user object to a list of users */
router.get("/", (req, res) => {
  // return res.send("GET HTTP method on user resource");
  // return res.send(Object.values(users));
  return res.send(Object.values(req.context.models.users));
});

// pick a user from the object by identifier for the single user's route
app.get("/:userId", (req, res) => {
  // return res.send(users[req.params.userId]);
  return res.send(req.context.models.users[req.params.userId]);
});

export default router;
