/* both user entities and message entities are objects that can be accessed
through identifiers */
let users = {
  1: {
    id: "1",
    username: "Robin Wieruch",
  },
  2: {
    id: "2",
    username: "Dave Davids",
  },
};

let messages = {
  1: {
    id: "1",
    text: "Hello World",
    userId: "1",
  },
  2: {
    id: "2",
    text: "Bye World",
    userId: "2",
  },
};

export default {
  users,
  messages,
};
