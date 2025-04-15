/* *Ask, who (server) is serving whom (client) and who (client) consumes 
whom's (backend) functionalities 
- REST - architecture that leverages the HTTP protocol to enable communication
between a client and a server app 
- server app that offers a REST API is a RESTful server 
- cURL - software providing a library and a command-line tool for transferring
data using various protocols including HTTP */
require("dotenv").config();
/* imports Cross-Origin Resource Sharing middleware 
allowing my API to be safely accessed from web pages hosted on different domains
or ports */
const cors = require("cors");
const express = require("express");

const app = express();

/* - enables CORS for all incoming requests
- allows requests from any origin
- handles CORS headers
supports pre-flight (OPTIONS) requests */
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);

/* curl http://localhost:3000 in another command line window 
my command line tool, cURL, is a client that consumed by my Express server, so my 
Express server just got consumed by something other than a browser */
