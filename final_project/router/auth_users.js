const express = require('express');
const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");
const regd_users = express.Router();
const JWT_SECRET = 'randomSecret';

let users = [];

const isValid = (username) => { //returns boolean
  if (users.filter(user => user.username == username).length > 0) return true;
  return false;
}

const authenticatedUser = (username, password) => { //returns boolean
  const validUser = users.filter(user => {
    return (user.username === username && user.password === password)
  });
  return validUser.length == 1 ? true : false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) return res.status(400).send({ message: "plase register!" });
    if (!authenticatedUser(username, password)) return res.status(400).send({ message: "plase provide valid credentials!" });
    //generating the token
    const token = jwt.sign({
      username: username,
      password: password
    }, JWT_SECRET, { expiresIn: 60 * 1 });
    //saving the token in the session 
    req.session.authorization = {
      token, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(400).send({ message: "plase provide valid credentials!" })
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const username = req.session.authorization['username'];
  const isbn = req.params.isbn;
  if (!bookExist) return res.status(400).send({ message: "plase provide valid isbn!" })
  if (req.query.review) {
    const review = req.query.review;
    if (!userAlreadyReviewd(username, isbn)) {
      books[isbn].reviews.username = review;
      return res.status(200).send("A new review has been added successfully!");
    } else {
      books[isbn].reviews.username = review;
      return res.status(200).json({
        message:`${username} review on the book ${books[isbn].title} has been updated!`,
        books: books
      }).send();
    }
  }
  return res.status(400).send({ message: "plase provide valid review!" })

});

//Delete a book review 
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  if (!bookExist) return res.status(400).send({ message: "plase provide valid isbn!" })
    if(books[isbn].reviews.username){
      delete books[isbn].reviews.username;
      return res.status(200).send("the review has been deleted!");
    }else{
      return res.status(200).send("You dont have any reviews!");
    }
})

const bookExist = (isb) => {
  return books[isb] ? true : false;
}

const userAlreadyReviewd = (username, isbn) => {
  const reviews = books[isbn].reviews;
  return reviews.username ? true : false;
}

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
