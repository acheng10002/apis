/* - I want my REST API to be easy to understand for anyone consuming them,
future-proof, and secure and fast; it serves data to clients that may be confidential 
- REST APIs allow clients including browser apps to communicate to services 
- REST API is an archtectural style, has two main constraints: stateless communication 
and cacheable data 
- REST APIs are most commonly called over HTTPS */
const express = require("express");
const apicache = require("apicache");
const app = express();

let cache = apicache.middleware;
// adds a in-memory cache into my server, caches results for 5 minutes
app.use(cache("5 minutes"));
/* Accept and respond with JSON 
- REST APIs should accept JSON for request payload and send responses to JSON 
- JSON is the standard for transferring data 
- networked technology can use it: JS has built-in methods to encode and decode JSON, 
through the Fetch API or through another HTTP client 
- server-side technology can use it: there are libraries that can decode JSON 
- to make sure when my REST API app responds with JSON that clients interpret it as 
JSON, set Content-Type header in the response to application/json; charset=utf-8 
after the request is made */
app.get("/data", (req, res) => {
  res.set("Content-Type", "application/json; charset=utf-8");
  res.send(JSON.stringify({ message: "Hello, world" }));
});

app.post("/", (req, res) => {
  // Express automatically sets the correct header here, I want a JSON response
  res.json(req.body);
});

/* Use nouns instead of verbs in endpoint paths 
Name collections with plural nouns 
- the nouns represent the entity that the endpoint that I'm retrieving or manipulating
as the pathname */
app.get("/articles", (req, res) => {
  const articles = [];
  // code to get articles...
  res.json(articles);
});

app.post("/articles", (req, res) => {
  // code to add a new article...
  res.json(req.body);
});

app.put("/articles/:id", (req, res) => {
  const { id } = req.params;
  // code to update an article...
  res.json(req.body);
});

/* /articles represents a REST API resource, and I can use Express to add endpoints for
manipulating articles */
app.delete("/articles/:id", (req, res) => {
  const { id } = req.params;
  // code to delete an existing article with the given ID ...
  res.json({ deleted: id });
});

/* POST, PUT, and DELETE endpoints all take JSON as req.body and return JSON as response
GET endpoint also returns JSON as response */

/* Nesting resources for hierarchical objects/ Use logical nesting on endpoints
- group endpoints that contain associated information
- if one object can contain another object, design the endpoint to reflect that 
- good practice regardless of whether my database is structure like this
* avoid mirroring my database structure in my endpoints to avoid giving attackers 
unnecessary info 

- endpoint that gets the comments for a news article identified by articleId 
- 'comments' is after '/article.:articleId' path means 'comments' is a child 
resource of '/article' 
- comments are the children objects of the articles 
- nested endpoints get unwieldy after the second or third level
-- instead return to the URL to these resources instead, especially if the data
is not contained within the top level object 
-- ex. instead of /articles/:articleId/comments/:commentId/author, 
use "author": "/users/:userId" which returns the UR for that particular user within 
the JSON response instead */
app.get("/articles/:articleId/comments", (req, res) => {
  const { articleId } = req.params;
  const comments = [];
  // code to get comments by articleId and return it in the response
  res.json(comments);
});

/* Handles errors gracefully and return standard codes 
- gives maintainers of the API enough info to understand the problem that's occurred 
but not enough info for the attackers to use the error content to carry out attacks
- 400 Bad Request - client-side input fails validation
- 401 Unauthorized - user is not authorized/authenticated to access a resource
- 403 Forbidden - user is authenticated but is not allowed to access a resource
- 404 Not Found - resource is not found
- 500 Internal server error - generic server error/ shouldn't throw this explicitly
- 502 Bad Gateway - invalid response from an upstream server
- 503 Service Unavailable - something unexpected happened on server side 
-- ex. server overload, some parts of the system failed, etc. */
app.post("/users", (req, res) => {
  const { email } = req.body;
  const userExists = users.find((u) => u.email === email);
  if (userExists) {
    /* rejects the data from the request payload, and returns a 400 response */
    return res.status(400).json({ error: "User already exists" });
  }
  res.json(req.body);
});

/* Allow filtering, pagination, and sorting
- filtering and pagination reduce the usage of server resources
- filtering - data shouldn't be returned all at once because it's too slow
and will bring down my systems, the data should be filtered
- pagination - splitting a large dataset into smaller, manageable chunks
(pages), data should be returned a few results at a time, otherwise
resources get tied up for too long by trying to get all the requested data
at once */
const employees = [
  { firstName: "Jane", lastName: "Smith", age: 20 },
  // ...
  { firstName: "John", lastName: "Smith", age: 30 },
  { firstName: "Mary", lastName: "Green", age: 50 },
];

app.get("/employees", (req, res) => {
  // destructures query parameters into firstName, lastName, and age variables
  const { firstName, lastName, age } = req.query;
  // creates a shallow copy of employees and assigns it to results
  let results = [...employees];
  /* run filter on each query parameter value to locate the matching items I 
  want to return */
  if (firstName) {
    results = results.filter((r) => r.firstName === firstName);
  }
  if (lastName) {
    results = results.filter((r) => r.lastName === lastName);
  }
  if (age) {
    // + is the unary plus operator which converts a value to a number
    results = results.filter((r) => +r.age === +age);
  }
  /* return the filter results as JSON response 
  ex. GET request to path with this query string, /employees?lastName=Smith&age=30 
  returns 
  [
    {   
        "firstName": "John",
        "lastName: "Smith",
        "age": 30
    }
  ] */
  res.json(results);
});

app.get("/employees/paginatedresults", (req, res) => {
  // extracts page query parameter from request URL, page defaults to 1
  const page = +req.query.page || 1;
  /* sets a constant value of 20 items per page
  defines the chunk size of data returned per request */
  const pageSize = 20;

  /* calculates the index in the array where this page should begin
  if page = 2, startIndex = 20 */
  const startIndex = (page - 1) * pageSize;
  /* calculates the index one page the last item for the current page
  if page = 2, endIndex = 40 */
  const endIndex = page * pageSize;

  /* extracts a subset of employees, entries from startIndex up to but not 
  including endIndex */
  const paginatedResults = employees.slice(startIndex, endIndex);

  res.json(paginatedResults);
});

/* - I can specify the fields to sort by in the query string
- I can get the parameter from a query string with the fields I want to sort 
the data for, and I can sort the data by those individual fields 
ex. http://example.com/articles?sort=+author,-datepublished
+ means ascending, - means descending, so this sorts by author's name in
alphabetical order and datepublished from most recent to least recent */
app.get("/employees/sortedresults", (req, res) => {
  // extracts page query parameter from request URL, page defaults to 1
  const page = +req.query.page || 1;
  /* sets a constant value of 20 items per page
  defines the chunk size of data returned per request */
  const pageSize = 20;

  /* reads the sort query parameter, if not there uses an empty string 
  split(",") turns it into an array 
  filter(Boolean) removes any empty string caused by ,, or no input */
  const sortFields = (req.query.sort || "").split(",").filter(Boolean);
  // creates a shallow copy of employees array to origin is not modified
  let results = [...employees];

  // checks if there are any fields to sort by
  if (sortFields.length > 0) {
    // a and b are pairs of employee objects being compared
    results.sort((a, b) => {
      // iterates over the list of fields to sort by, in the given order
      for (let field of sortFields) {
        // dynamically access each field from employee object a and b
        const valA = a[field];
        const valB = b[field];

        /* compares the two field values from object a and b
        if a's value is less than b's for this field, return -1 to place 
        a before b
        if a's value is greater than b's for this field, return 1 to place
        a after b */
        if (valA < valB) return -1;
        if (valA > valB) return 1;
      }
      // if all specified fields are equal between a and b, consider them equal for sorting
      return 0;
    });
  }
  // apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  const paginatedResults = employees.slice(startIndex, endIndex);

  res.json(paginatedResults);
  /* ex. GET /employees?sort=+lastName,-age&page=1 
  sorts employees by lastName in alphabetical order, then age in descending 
  order, returns first 20 results after sorting */
});

/* Maintain Good Security Practices 
- use SSL/TLS for security
- a SSL certificate isn't too difficult to load onto a server, make my REST APIs
communciate over secure channels 
- people shouldn't be able to access more information than they request
-- this is the principle of least privilege - add role checks for either a single
role or have more granular roles for each user 
-- for more granular roles for each user, I have to make sure admins can add and
remove features users have access to 
- also add preset roles that can be applied to a group users */
/* Cache data to improve performance 
- I can add caching to return data from the local memory cache instead of querying the db
- with caching, users get data faster, but the data may be outdated */
/* Version my APIs 
- version my APIs if I make any changes to them that may break clients
- versioning can be done according to semantic version 
- ex. 2.0.6 MAJOR.MINOR.PATCH
-- major - incompatible API changes, minor - backward-compatible features, 
patch - backward-compatible bug fixes 
- gradually phases out old endpoints instead of forcing everyone to move to the new API 
at the same time, important to do this for public APIs 
- also version my APIs, so I don't break third party apps that use my APIs 
- versioning is usually done with /v1/, /v2/, etc. added to the start of the API path */
app.get("v1/employees", (req, res) => {
  const employees = [];
  // code to get employees
  res.json(employees);
});

app.get("v2/employees", (req, res) => {
  const employees = [];
  // different code to get employees
  res.json(employees);
});

app.listen(3000, () => console.log("server started"));
/* for high-quality REST APIs:
- follow web standards and conventions: JSON, SSL/TLS, and HTTP status codes 
- increase performance by not returning too much data at once and caching so
I don't have to query for data all the time
- use nouns for the paths of endpoints since HTTP methods indicate the action
I want tot ake
- paths of nested resources should come after the path of the parent resource
- paths should tell me what I'm getting or manipulating without the need to read
more docs */
