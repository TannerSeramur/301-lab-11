'use strict'

// setup
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const ejs = require('ejs');


require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

const client = new pg.Client(process.env.DATA_BASE_URL)
client.connect();
client.on('err', err=>console.log(err));

app.use(cors());


app.listen(PORT, ()=>{console.log(`app is running on ${PORT}`)});

app.use(express.static('./public'))
app.use(express.urlencoded({extended:true}))



app.get('/',(req, res) =>{
  res.render('./pages/index');
});

app.post('/searches', getBooks);

app.post('/error', handleError );

////////////////////////////////////////////////////////////////////////////////////////////


// error handler
function handleError (err) {
  // console.error('********',err, '#########');
  ejs.render('./pages/error.ejs');

  // app.post('/error',(req, res) =>{
  //   res.render('./pages/error.ejs');
  // });

  // app.get('/error', () =>{
  //   res.render('./pages/error.ejs');
  // });
}



////////////////////////////////////////////////////////////////////////////////////////////


// books constructer function
function Book(data ){
  // console.log(data);
  this
  let noData = 'No Data Found';
  this.title = (data.title ? data.title : noData );
  this.author = (data.authors ? data.authors[0] : noData ); // only grabbing the first author
  this.description = (data.description ? data.description : noData );
  this.image = (data.imageLinks.thumbnail ? data.imageLinks.thumbnail : noData );
  // this.searched
}

function getBooks(req, res){
  const searchedWord = (req.body.title ? req.body.title : req.body.author);
  const searchAuthor = (req.body.author ? `?q=inauthor+${req.body.author}` : null )
  const search = (req.body.title ? `?q=intitle+${req.body.title}` : searchAuthor);

  // console.log('this is our req.body.author', search);

  const URL = `https://www.googleapis.com/books/v1/volumes${search}`;
  return superagent.get(URL)
    .then(results => {
      const bookArr = [];
      results.body.items.forEach(book => {
        bookArr.push(new Book(book.volumeInfo));
        // console.log('!!!!!!!!!!!', book);
      });
      bookArr.push(searchedWord);
      console.log(bookArr, '$$$$$$$$$$$')
      res.render('./pages/searches/show.ejs', {bookItems:bookArr});
      // res.render('./pages/searches/show.ejs', {searchedWord:searchedWord});

    })
    .catch(error => (handleError(error)));
}



