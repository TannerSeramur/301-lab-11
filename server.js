'use strict'

// setup
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
// const ejs = require('ejs');


require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err=>console.log(err));

app.use(cors());


app.listen(PORT, ()=>{console.log(`app is running on ${PORT}`)});

app.use(express.static('./public'))
app.use(express.urlencoded({extended:true}))



app.get('/',retrieveSQL);

app.post('/searches', getBooks);

app.post('/error', handleError );

////////////////////////////////////////////////////////////////////////////////////////////


// error handler
function handleError (err) {
  console.error('********',err, '#########');
  // ejs.render('./pages/error.ejs');

  // app.post('/error',(req, res) =>{
  //   res.render('./pages/error.ejs');
  // });

  // app.get('/error', () =>{
  //   res.render('./pages/error.ejs');
  // });
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
      console.log(resultsArr, 'right herr');
      res.render('./pages/index',{savedItems: resultsArr});
    })
    .catch(error => (handleError(error)));
  // console.log(savedBooks, 'saved books here');

}

