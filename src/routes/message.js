// helper library that generates unique identifiers
const { v4: uuidv4 } = require("uuid");
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  // return res.send(Object.values(messages));
  return res.send(Object.values(req.context.models.messages));
});

router.get("/:messageId", (req, res) => {
  // return res.send(messages[req.params.messageId]);
  return res.send(req.context.models.messages[req.params.messageId]);
});

router.post("/", (req, res) => {
  // uses uuid library to generate a unique identifier for the message
  const id = uuidv4();
  /* makes the identifier a property in a message object 
    with shorthand object property initialization - creates object properties more
    concisely when the property name and variable name are the same */
  const message = {
    id,
    /* client has to probide the text string for the message
      HTTP POST method allows data to be sent as a payload in a body
      payload can then be extracted from req 
      - if I use the JSON format, I will need to type the request object's body tag 
      when necessary 
      - this middleware to available on an application level - each request that 
      arrives at one of my Express routes goes through the middleware, so all data
      sent by a client to my server is available in the incoming request's body */
    text: req.body.text,
    /* after the middleware above runs, I can get the authenticated user from the 
      request object and append it as message creator to the message object */
    userId: req.context.me.id,
  };
  /* assigns the message by identifier in messages object
    messages object is my pseudo db */
  req.context.models.messages[id] = message;

  // return the new message after it has been created
  return res.send(message);
});

// const date = Date.parse(req.body.date);
// const count = Number(req.body.count);

// DELETE /messages/:messageId
router.delete("/:messageId", (req, res) => {
  /* - uses a dynamic object property to exclude the message I want to delete 
    - req.params.messageId extracts the ID from the request path 
    - object destructuring with computed property names - 
    - removes the message with the specified ID from the messages object 
    -- message - holds the value of the message being deleted
    -- otherMessages - new object that contains all other key-value pairs except the one
    with key messageId
     */
  const { [req.params.messageId]: message, ...otherMessages } =
    req.context.models.messages;
  /* reassigns messages to the filtered object, otherMessages, deleting the target 
    message from the in-memory store */
  req.context.models.messages = otherMessages;

  // responds with deleted message as confirmation
  return res.send(message);
});

export default router;
