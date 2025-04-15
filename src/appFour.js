/* - Explain how token authentication differs from session based authentication
- What are JSON Web Tokens?
-- secure token can be generated and passed between my backend and frontend code
-- ensures that my user's username and pw are not compromised and gives me the 
ability to expire my user's session 
-- JWT is for authorization NOT authentication
--- authentication as in authenticating a user at login, their username and pw
--- authorization as in authorizing user access to protected routes and resources,
ensuring that the user getting authorized is the same as the authenticated user
--- normally, authorization can be done through sessions
- session ID gets sent down in the browser's cookies 
- browser cookies: client-side, cookies stored by the browser for a domain
vs. cookie header: request-side, HTTP header automatically sent by browser with cookies
- every time the client browser makes a request, the client sends the session ID 
to the server, server checks its memory and says what user has that session ID,
server finds that user, server does the authorization to make sure the user has access
1. user logs in from the client browser POST /user/login { email, password }
2. server does the user authentication, and if user is authenticated, server stores the
user in session in server memory
3. server gets a unique id for the session in memory and sends this session ID as cookie
back to the browser, that way the client always has that session ID
4. client then sends the session ID cookie to the server on every next request
5. server goes into session memory and gets user from session based on ID and verifies them
*server has to do a lookup to find the user based on the session ID
6. server checks to see if the user is authorized, and if they are, it send a response
to the client saying you're good, here's the resource you wanted

1. user logs in from the client browser POST /user/login { email, password }
2. instead of storing info on the server, inside session memory, server creates JWT for 
user (it encodes and serializes the user) and signs it with a secret key
(if the JWT has been tampered with, server would know because of the secret key signature)
3. server sends the JWT to the client in the response body of the HTTP request
*nothing gets stored in the server
*JWT has all info about the user encoded and serialized into it
- header: has algorithm for encoding and decoding the JWT
- payload: info in the token 
-- sub (subject/common field): id of user I am authenticating
-- iat: issued at
-- eat (or exp): expired at
- signature: way to verify that the JWT hasn't been changed by the client before it's
sent back to the server
-- base64 encodes the header and the payload sections
-- algorithm from header encodes the header and payload data and then also secret
(server takes the token, decodes the base64 encoded header and payload, hashes it with the 
algorithm in the header, and the result should look like the last part of the key)
*user object is stored on the client, and the server doesn't have to remember anything
*the same JWT can be used across multiple servers that I run, without the issue of one
server having a certain session and another server not having the session 
4. client stores the JWT however it wants, in cookie storage, etc., then it sends JWT to the 
server on every next request
5. server verifies the JWT signature (verifies that the JWT has not been changed), deserializes
the JWT into JSON format, and reads the user object from the JWT
6. server checks to see if the user is authorized, and if they are, it send a response
to the client saying you're good, here's the resource you wanted
- instead of using cookies, JWT uses a web token to do the authorization instead of the
server doing the authorization
-- 1. user signs in to my app
2. a secure token is created
3. then for all subsequent requests, that token is passed in the header of my 
request object
-- instead of setting and checking a cookie, I'm passing a special token in the
header of my request
-- Passport middleware checks the cookie that is sent and either authenticates 
or denies the user, JWT will work similarly except the token is passed instead of
using cookies 
-- JWT protects routes in an API:
--- authentication can be added to fetch a token, and then requests can be made
with that token to access protected routes
--- ex. Node.js API on backend, React on frontend:
- request to login
- get the token back
- store the token in LocalStorage
- the token gets saved to be used later to to make requests to protected routes
- ex. route to create a blog post
-- What are two things a secure token will do?
--- a secure token will get signed and verified
-- Where in the code is a secure token passed? 
--- token should be passed in the header of my request object
- What is an authorization header? How do I use it?
-- header in the request object where token is stored
- Identify and explain the methods used to sign and verify tokens.
-- jwt.sign - creates a JWT that encodes the user info and attaches a signing key
-- jwt.verify - extracts and attaches the token to the request object, validates the token
- Write custom middleware to verify tokens on a given route.
- Have familiarity with token expiration with JWT.
- Expand PassportJS implementation to use JSON Web Tokens */
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

app.post("/api/posts", verifyToken, (req, res) => {
  /* - verifyToken middleware extracts and attaches the token to the 
  request object 
  - this route requires a valid JWT to proceed 
  - jwt.verify validates the token 
  -- "secretkey" must match the one used in jwt.sign() during login 
  -- if valid, authData will contain the decoded token payload (e.g. user info)
  -- if invalid or expired, err with be populated */
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      // if token verification fails, respond with forbidden
      res.sendStatus(403);
    } else {
      // if token is valid, send a success response with a message
      res.json({
        message: "Post created...",
        // and with decoded user info
        authData,
      });
    }
  });
});

// this is typically called by a client, frontend app, to log in a user
app.post("/api/login", (req, res) => {
  /* mock user with a mock login request 
  in a real app, I'd validate credentials and fetch this from a db */
  const user = {
    id: 1,
    username: "amy",
    email: "amy@gmail.com",
  };
  /* - calls jwt.sign() to create a JWT that encodes the user info 
  - "secretkey" is the signing key - used to verify the token later 
  - callback receives err and the generated token 
  - the token includes the user object in its payload, and is signed
  using the secret key to prevent tampering
  - options object allows setting of expiration */
  jwt.sign({ user }, "secretkey", { expiresIn: "30s" }, (err, token) => {
    /* - sends the signed token back to the client in JSON
    - client can now use this token for authenticated requests (e.g.
    in the Authorization header_ */
    res.json({
      token,
    });
  });
});

/* Format of token:
Authorzation: Bearer <access_token> */

function verifyToken(req, res, next) {
  // gets auth header value that was the token sent
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    /* splits at the space 
    split turns a string into an array, and will splits the string into
    two array elements, [Bearer, <access-token>] */
    const bearer = bearerHeader.split(" ");
    // gets token from array
    const bearerToken = bearer[1];
    // sets the token
    req.token = bearerToken;
    next();
  } else {
    // forbidden because token missing from bearerHeader
    res.sendStatus(403);
  }
}

app.listen(3000, () => console.log("Server started on port 3000"));

/* tokens (JWTs)
- stored manually in localStorage or memory
- sent via Authorization header (Bearer)
- client-side control, client decides when to send
- requires extra protection against CSRF
- higher XSS risk if stored in localStorage
- needs manual CORS handling
cookies 
- stored automatically by browser in document.cookie
- sent automatically via Cookie header 
- browser control, browser automatically sends with every request 
- vulnerable to CSRF, needs CSRF tokens 
- lower XSS risk if using HttpOnly flag 
- needs SameSite + CORS + credential flags 

types of storage
- memory (RAM): temporary, fast-access storage
                very fast speed
                not persistent, cleared on restart
                ex. caching, in-memory data structures
- cache (in memory): optimizied for fast repeated access
                     very fast speed
                     not persistent or optional
                     ex. Redis, Memcached
- disk (persistent storage): long-term data storage
                             slower speed
                             persistent, survives restart
                             ex. db, file systems
- db (disk-backed): structured storage with query interface
                    medium speed
                    persistent
                    ex. SQL, NoSQL systems
- session storage: scoped to a user session
                   fast speed
                   persistence depends
                   ex. in-memory, cookies, sb
- cloud/object storage: blob/file storage over network
                        variable speed
                        persistent
                        ex. AWS S3, Azure Blob

Redis */
