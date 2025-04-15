// environment variables
require("dotenv").config();
// server framework
const express = require("express");
// to work with file paths
const path = require("path");
// for hashing passwords
const bcrypt = require("bcrypt");
// for creating and verifying JWTs
const jwt = require("jsonwebtoken");
// for handling authentication
const passport = require("passport");
// db access layer
const { PrismaClient } = require("@prisma/client");
// Passport JWT strategy components
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

// initializes the Express app
const app = express();

// initializes the Prisma client for db access
const prisma = new PrismaClient();

// uses a secret from .env to sign JWTs and falls back to a hardcoded value
const SECRET = process.env.JWT_SECRET || "supersecret";

// sets EJS as the view engine
app.set("view engine", "ejs");
// configures the views folder location
app.set("views", path.join(__dirname, "views"));

// parses form data
app.use(express.urlencoded({ extended: true }));

// registers Passport JWT Strategy
passport.use(
  // from passport-jwt
  new JwtStrategy(
    {
      // tells the strategy to find the token in the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      /* defines the secret key used to verify the token's signature 
      (must match the secret used when the token was originally signed with
      jwt.sign()) */
      secretOrKey: SECRET,
    },
    /* callback function invoked after the JWT is decoded and verified 
    jwt_payload - decoed payload from the token
    done - function Passport uses to complete the authentication flow */
    async (jwt_payload, done) => {
      try {
        /* looks up the user in the db using Prisma, based on the user id 
        embedded in the JWT payload */
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.id },
        });
        /* if a user is found, authentication success 
        if not found, user is not authenticated */
        return done(null, user || false);
      } catch (err) {
        // if an error occurs, signals an authentication error
        return done(err, false);
      }
    }
  )
);

// initializes Passport middleware
app.use(passport.initialize());

// redirects root path to the login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

// renders the registration form
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// handles registration form submission
app.post("/register", async (req, res) => {
  // destructures username and pw from request body
  const { username, password } = req.body;
  // hashes the password
  const hash = await bcrypt.hash(password, 10);
  try {
    // creates a new user
    await prisma.user.create({ data: { username, password: hash } });
    // redirects to login on success
    res.redirect("/login");
  } catch (err) {
    // shows error if user exists
    res.render("register", { error: "User already exists" });
  }
});

// renders the login form
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// authenticates the user for login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // verifies credentials
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.render("login", { error: "Invalid credentials" });
  }

  /* issues a token using jsonwebtoken library
  jwt.sign(payload, secretOrPrivateKey, options) 
  - token can be sent to the client for authenticated access to protected routes
  - payload - part of the token that contains user-specific data, { id: user.id } 
  - secretOrPrivateKey - used to digitally sign the token, must be the same when 
  I later call jwt.verify(), SECRET
  - option -{ expiresIn: "1h" }  */
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
  // redirects to /profile with token in query string
  res.redirect(`/profile?token=${token}`);
});

app.get("/profile", (req, res, next) => {
  // retrieves token from the query string
  const token = req.query.token;
  // if the token is missing, redirects the user to the login page
  if (!token) return res.redirect("/login");

  /* verifies the token using the SECRET key (must match the one used when signing 
  the token) 
  - if valid, decoded will contain the token's payload 
  - if invalid, err will be set */
  jwt.verify(token, SECRET, async (err, decoded) => {
    // if verification fails (invalid or expired token), redirect to login
    if (err) return res.redirect("/login");
    /* use Prisma ORM to query the User table and find the user by the ID from 
    the decoded token */
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    // if user exists, render profile view and pass user object as a variable
    res.render("profile", { user });
  });
});

// listen for requests at port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
