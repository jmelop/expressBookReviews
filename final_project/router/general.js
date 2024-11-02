const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const formattedBooks = await new Promise((resolve, reject) => {
      resolve(JSON.stringify(books, null, 4));
    });

    return res.status(200).send(formattedBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).send({ error: "Unable to fetch books" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject({ message: "Book not found." });
      }
    }, 3000);
  });

  promise
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(404).json(err);
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  let foundBooks = [];

  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      for (const key in books) {
        if (books.hasOwnProperty(key)) {
          const book = books[key];
          if (book.author.toLowerCase() === author.toLowerCase()) {
            foundBooks.push(book);
          }
        }
      }

      if (foundBooks.length > 0) {
        resolve(foundBooks);
      } else {
        reject({ message: "No books found by this author" });
      }
    }, 3000);
  });

  promise
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const foundBooks = [];
      for (const key in books) {
        if (books.hasOwnProperty(key)) {
          const book = books[key];
          if (book.title.toLowerCase() === req.params.title.toLowerCase()) {
            foundBooks.push(book);
          }
        }
      }
      if (foundBooks.length > 0) {
        resolve(foundBooks);
      } else {
        reject({ message: "No books found with this title" });
      }
    }, 3000);
  });

  promise
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this ISBN" });
  }
});

public_users.post("/review/:isbn", function (req, res) {
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

  if (book.reviews && book.reviews[username]) {
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully." });
  } else {
    if (!book.reviews) {
      book.reviews = {};
    }
    book.reviews[username] = review;
    return res.status(201).json({ message: "Review added successfully." });
  }
});

module.exports.general = public_users;
