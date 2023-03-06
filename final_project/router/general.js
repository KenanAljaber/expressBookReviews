const axios = require('axios').default;
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {

  if (req.body.user) {
    const reqUser = req.body.user;
    if (users.filter(user => user.email === reqUser.email).length == 0) {
      console.log(users);
      users.push(reqUser);
      return res.status(200).send(`user ${reqUser.username} has been registred successfully`)
    } else {
      return res.status(400).send(`user does already exist!`)
    }

  } else {
    return res.status(400).send('plaese provide a valid user!')
  }

});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

  const get_books = new Promise((resolve, reject) => {
    resolve(res.json(books).send());
  });

  get_books.then(() => console.log("Promise for Task 10 resolved"));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const getBookByIsb = new Promise((resolve, reject) => {
    if (req.params.isbn) {
      if (books[req.params.isbn]) {
        const book = books[req.params.isbn];
        resolve(res.status(200).json(book).send())
      }
      reject(res.status(400).json({ message: "book does not exist!" }).send())
    }
    reject(res.status(400).json({ message: "please provide a valid book id!" }).send())
  })

  getBookByIsb.then(() => console.log("everything is ok")).catch((err) => console.log("error has happened ", err));
});




// Get book details based on author
public_users.get('/author/:author', async function (req, res) {


  const author = req.params.author;
  let authorBooks = [];
  if (!author) return res.status(400).json({ message: "please provide a valid book author!" }).send();
  //this step is only done to acomplish the task using axios.
  //instead we can easily get the books from object books
  //-----------------
  const fetchedBooks = await (await axios.get('http://localhost:5000/')).data;
  //----------------
  authorBooks = filterBooksByCreteria('author', author, fetchedBooks);
  if (authorBooks.length > 0) {
    return res.status(200).json(authorBooks).send();
  } else {
    return res.status(400).json({ message: "books do not exist for the provided author!" }).send();
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  let titleBooks = [];
  if (!title) return res.status(400).json({ message: "please provide a valid book title!" }).send();
  //this step is only done to acomplish the task using axios.
  //instead we can easily get the books from object books
  //---------------------------------
  const fetchedBooks = await (await axios.get('http://localhost:5000/')).data;
  //-----------------------------------
  titleBooks = filterBooksByCreteria('title', title, fetchedBooks);
  if (titleBooks.length > 0) {
    return res.status(200).json(titleBooks).send();
  } else {
    return res.status(400).json({ message: "books do not exist for the provided title!" }).send();
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  if (req.params.isbn) {
    if (books[req.params.isbn]) {
      return res.status(200).json(books[req.params.isbn].reviews).send();
    } else {
      return res.status(400).json({ message: "book does not exist!" }).send();
    }
  }
  return res.status(400).json({ message: "please provide a valid book id!" }).send();
});


function filterBooksByCreteria(cretiera, filter, fetchedBooks) {
  const resultBooks = [];
  Object.keys(fetchedBooks).forEach(bookId => {
    if (fetchedBooks[bookId][cretiera].toLowerCase() == filter.toLowerCase()) {
      resultBooks.push(books[bookId]);
    }
  });
  return resultBooks;
}

module.exports.general = public_users;


