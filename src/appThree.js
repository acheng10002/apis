/* - how to use cURL to verify my Express app's REST API implemented on the
command line instead of the browser 
- with Express, I can create and expose REST APIs to communicate as a client
with my server application */
require("dotenv").config();
// third-party Express middleware
const cors = require("cors");
const express = require("express");
const models = require("./models");
const routes = require("./routes");
const app = express();

app.use(cors());

/* takes care of the main path 
mount the modular routes from Express Router with dedicated URIs */
app.use("/session", routes.session);
app.use("/users", routes.user);
app.use("/messages", routes.message);

/* Express provides built-in middleware that transforms body types from
request objects (e.g. json, urlencoded) 
- so I can access the payload of an HTTP POST request as req.body
- req.body with the message's text is accessible whether it is sent by a regular
POST request or a POST request from a HTML form
- all data should be received and sent as JSON payload
- REST is not opinionated about the payload format (JSON, XML), but once I 
choose a format, I should stick with it for the entire API 
- XML - text-based format used to store and transport structured data 
curl -X POST -H "Content-Type:application/json" http://localhost:3000/messages -d '{"text":"Hi again, World"}' 
- -X flag specifies the HTTP request method
- curl usually sets the correct method automatically 
- -H flag specifies HTTP headers, will say I want to transfer JSON
- -d flag specifies the data as payload 
-- creates my first resource (message) via my REST API
- http://localhost:3000/messages/8646e5ea-fc66-4954-9999-4efb569d70e3 
-- requests the same resource from my REST API */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* more routes to accomodate a RESTful API for my Express app
the URI itself doesn't change, but the HTTP method used from my Express 
instance does */
app.get("/", (req, res) => {
  return res.send("Received a GET HTTP method");
});

app.post("/", (req, res) => {
  return res.send("Received a POST HTTP method");
});

app.put("/", (req, res) => {
  return res.send("Received a PUT HTTP method");
});

app.delete("/", (req, res) => {
  return res.send("Received a DELETE HTTP method");
});

app.post("/users", (req, res) => {
  return res.send("POST HTTP method on user resource");
});

/* every Express instance's method maps to a HTTP method 
- the following four cURL commands give the following outputs
- by default cURL uses a HTTP GET method
curl http://localhost:3000
-> Received a GET HTTP method

- I can specify the HTTP method with the -X flag (or --request flag)
- depending on the HTTP method I am choosing, I will access different 
routes of my Express app, which all represent only a single API endpoint 
with an URI so far
curl -X POST http://localhost:3000
-> Received a POST HTTP method

curl -X PUT http://localhost:3000
-> Received a PUT HTTP method

curl -X DELETE http://localhost:3000
-> Received a DELETE HTTP method 

- REST uses HTTP methods to perform CRUD operations on URI(s) 
- Express routes: URIs are REST resources */

/* custom middleware here - determines a pseudo authenticated user that is sending 
the request
- authenticated user is the user with the identifier 1, that gets assigned as me property
to the request object 
- this middleware could intercept each incoming request to determing from the incoming
HTTP headers whether the request comes from an authenticated user or not 
- this kind of middleware makes the client send over info of the currently authenticated
user, so the Express server can be stateless 
- load balancing - process of distributing incoming network traffic or computational
workload across multiple servers or resources
-- a server shouldn't keep the state (e.g. authenticated user) except for in a db
-- the server can have an application level authentication middleware
-- the server can then provide session state (e.g. authenticated user) to every route
in my Express app */
app.use((req, res, next) => {
  /* - passes the models in a custom application-level middleware to all routes 
  via a dedicated context object 
  - the mdoels are living outside of the file and can be refactored to actual 
  db interfaces */
  req.context = {
    models,
    // authenticated user can be placed in the context object as well
    me: models.users[1],
  };
  next();
});

/* - req.params.userId makes the PUT HTTP method/update operation and DELETE
HTTP method/delete operation RESTful from a URI's point of view 
- unique identifiers are used to indicate an exact user, assign them with 
parameters
- the callback holds the URI's parameter in the request object's properties
- Express route's method <=> HTTP method <=> REST operation 
- Express route's path <=> URI <=> REST resource 
- backend app, Express app, enables me to write an interface/REST API for CRUD operations
this enables me to read and write data from and to a db from a client app
- client -> (REST API -> server) -> db 
- the REST API belongs to/is exposed by the server app 
- client -> (GraphQL API: microservice -> server) -> db 
         -> (REST API: web service -> server) -> db
-- the servers don't even have to use the same programming language, since they're
communicating over a programming language agnostic interface (HTTP with REST) */
app.put("/users/:userId", (req, res) => {
  return res.send(`PUT HTTP method on user/${req.params.userId} resource`);
});

app.delete("/users/:userId", (req, res) => {
  return res.send(`DELETE HTTP method on user/${req.params.userId} resource`);
});

/* - listener - waits for something to happen, like a button click
-- event-driven programming (e.g. UI, DOM, Node.js)
-- reacts to events emitted within the same process
-- typical local scope/in-process
-- button.addEventListener('click', handler)
- subscriber - registers interest in a stream of published messages 
-- Pub/Sub systems (e.g. Redis, Kafka, MQTT, messaging queues)
-- reacts to messages published over a channel or topic
-- can be inter-process or distributed 
-- mqttClient.subscribe('sensor/temperature') */
app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);

/* - REST APIs are stateless because:
-- server does not remember any state about the client between requests
-- state (e.g. authentication, session info) is either stored in a shared db
or included in request headers (usually with a token like JWT)
- Middleware handles:
-- extracting the token or session identifier from the request
-- verifying it
-- injecting the authenticated user or session data in req.user

HTTP, HTML, and URL are the 3 standards that together implement the REST
architectural style in the World Wide Web 
*/
