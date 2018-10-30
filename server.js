'use strict'

// setup
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

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

app.get('/error', handleError );

////////////////////////////////////////////////////////////////////////////////////////////


// error handler
function handleError (err,res) {
  console.error(err);

  app.get('/error', () =>{
    res.render('./pages/error.ejs');
  });
}


////////////////////////////////////////////////////////////////////////////////////////////


// books constructer function
function Book(data){
  let noData = 'No Data Found';
  this.title = (data.title ? data.title : noData );
  this.author = (data.authors ? data.authors[0] : noData ); // only grabbing the first author 
  this.description = (data.description ? data.description : noData );
  this.image = (data.imageLinks.thumbnail ? data.imageLinks.thumbnail : noData );
}

function getBooks(req, res){
  // console.log('This is our req: ', req.body);

  // if(req.body.title){
  //   const search = `intitle+${req.body.title}`
  // }

  const search = (req.body.title ? `intitle+${req.body.title}` : `inauthor+${req.body.author}`)

  console.log('this is our req.body.author', search);

  const URL = `https://www.googleapis.com/books/v1/volumes?q=${search}`;
  return superagent.get(URL)
    .then(results => {
      const bookArr = [];
      results.body.items.forEach(book => {
        bookArr.push(new Book(book.volumeInfo));
      });
      res.render('./pages/searches/show.ejs', {bookItems:bookArr});
    })
    .catch(error => handleError(error));
}



