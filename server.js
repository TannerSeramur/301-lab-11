
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

app.post('/addBook', save);

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
  // console.log('@@@@@@@@@@@@',data)
  this.title = data.title ? data.title : 'No Data Found' ;
  this.author = data.authors ? data.authors[0] : 'No Data Found' ; // only grabbing the first author
  this.isbn =data.industryIdentifiers[0].identifier ? data.industryIdentifiers[0].identifier : 'No Data Found';
  this.image = data.imageLinks.thumbnail ? data.imageLinks.thumbnail : 'https://via.placeholder.com/';
  // console.log('title--->',data.title);
  // console.log('title--->',data.title,'dataLinks--->',data.imageLinks);
  this.description = data.description ? data.description : 'No Data Found' ;
}

function save(req, res){
  let SQL = `
  INSERT INTO books
  (title,author,isbn,image_url,bookDescription)
  VALUES($1,$2,$3,$4,$5)`;
  let value = Object.values(req.body);
  client.query(SQL,value);
  res.redirect('/');
}

function getBooks(req, res){
  // const searchAuthor = (req.body.author ? `?q=inauthor+${req.body.author}` : null )
  const search = (req.body.title ? `?q=title+${req.body.title}` : `?q=author+${req.body.author}`);
  const URL = `https://www.googleapis.com/books/v1/volumes${search}`;
  return superagent.get(URL)
    .then(results => {
      const bookArr = [];
      results.body.items.forEach(book => {
        // console.log('log results.body.items-->',results.body.items)
        let newBook = new Book(book.volumeInfo);
        bookArr.push(newBook);
      });
      res.render('./pages/searches/bookSearch.ejs', {bookItems:bookArr});
    })
    .catch(error => (handleError(error)));
}

function retrieveSQL(req, res){
  const SQL = `SELECT * FROM books;`;
  // const savedBooks = [];
  client.query(SQL)
    .then(results =>{
      let resultsArr = results.rows;
      res.render('./pages/index',{savedItems: resultsArr});
    })
    .catch(error => (handleError(error)));
}
function getBookDetails(req,res){
  res.render('./pages/soloBook', {singleBook: req.body} );
}

function deleteBook(req, res){
  // console.log(req.body, 'workin')
  const SQL = `DELETE FROM books WHERE id =${req.body.id}`;
  client.query(SQL);
  res.redirect('/');
}



