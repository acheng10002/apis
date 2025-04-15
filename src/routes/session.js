const express = require("express");

const router = express.Router();

/* no need to define the /session URI path, only the subpaths
the URI path was already defined in the mounting process of the route in the Express app */
// dedicated route to the pseudo-authenticated user
router.get("/", (req, res) => {
  // return res.send(users[req.me.id]);
  /* instead of having access to the sample data in all routes from outside variables 
    (which is an unnecessary side-effect), I want to use the models and authenticated user
    from the function's arguments now */
  return res.send(req.context.models.users[req.context.me.id]);
});

export default router;
