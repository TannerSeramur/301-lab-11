'use strict'

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
var methodOverride = require('method-override');
// const ejs = require('ejs');


// app setup
const PORT = process.env.PORT || 3000;
const app = express();
require('dotenv').config();
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.static('./public'))
app.use(express.urlencoded({extended:true}))

// middleware

app.use(methodOverride((req, res) => {
  if(typeof(req.body) === `object` && '_method' in req.body){
    // console.log(req.body, 'HERE');

    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));



const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err=>console.log(err));


app.listen(PORT, ()=>{console.log(`app is running on ${PORT}`)});

// API Routes
app.get('/',retrieveSQL);

app.post('/searches', getBooks);

app.post('/error', handleError );

app.post('/book/:id', getBookDetails);

app.delete('/deleteBook/:id', deleteBook);


////////////////////////////////////////////////////////////////////////////////////////////


// error handler
function handleError (err) {
  console.error('********',err, '#########');
}



////////////////////////////////////////////////////////////////////////////////////////////


// books constructer function
function Book(data){
  this.title = (data.title ? data.title : 'No Data Found' );
  this.author = (data.authors ? data.authors[0] : 'No Data Found' ); // only grabbing the first author
  this.isbn =(data.industryIdentifiers[0].identifier ? data.industryIdentifiers[0].identifier : 'No Data Found');
  this.image = (data.imageLinks.thumbnail ? data.imageLinks.thumbnail : 'No Data Found');
  this.description = (data.description ? data.description : 'No Data Found' );
}
Book.prototype.save = function(){
  let SQL = `
  INSERT INTO books 
  (title,author,isbn,image_url,bookDescription)
  VALUES($1,$2,$3,$4,$5)`;

  let values = Object.values(this);
  client.query(SQL, values);
}

function getBooks(req, res){
  // console.log(res, 'res here )()()()()()' )
  // const searchedWord = (req.body.title ? req.body.title : req.body.author);
  const searchAuthor = (req.body.author ? `?q=inauthor+${req.body.author}` : null )
  const search = (req.body.title ? `?q=intitle+${req.body.title}` : searchAuthor);

  const URL = `https://www.googleapis.com/books/v1/volumes${search}`;
  return superagent.get(URL)
    .then(results => {
      const bookArr = [];
      results.body.items.forEach(book => {
        let newBook = new Book(book.volumeInfo);
        bookArr.push(newBook);
        // console.log(newBook, 'newbook*********');
        newBook.save();


      });
      // bookArr.push(searchedWord);
      res.render('./pages/searches/new.ejs', {bookItems:bookArr});
    })
    .catch(error => (handleError(error)));
}

function retrieveSQL(req, res){
  const SQL = `SELECT * FROM books;`;
  // const savedBooks = [];
  client.query(SQL)
    .then(results =>{
      let resultsArr = results.rows;
      // console.log(resultsArr, 'right herr');
      res.render('./pages/index',{savedItems: resultsArr});
    })
    .catch(error => (handleError(error)));
  // console.log(savedBooks, 'saved books here');
}
function getBookDetails(req,res){
  // console.log(req.body, 'req.body HERE');
  res.render('./pages/soloBook', {singleBook: req.body} );
}

function deleteBook(req, res){
  console.log(req.body, 'workin')
  const SQL = `DELETE FROM books WHERE id =${req.body.id}`;
  client.query(SQL);
  res.redirect('/');
}



