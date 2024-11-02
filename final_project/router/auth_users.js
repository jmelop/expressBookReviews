const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{
  const user = users.find(user => user.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ username }, 'jwt_secret', { expiresIn: '1h' });

  return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!review) {
      return res.status(400).json({ message: "Review is required." });
  }

  const book = books[isbn];

  if (!book) {
      return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews) {
      book.reviews = {};
  }

  book.reviews[username] = review; 

  return res.status(200).json({ message: "Review added/modified successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  const book = books[isbn];

  if (!book || !book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "Review not found." });
  }

  delete book.reviews[username]; 

  return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
