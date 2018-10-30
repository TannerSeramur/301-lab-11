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


//
app.get('/',(req, res) =>{
  res.render('./pages/index');
});

// books constructer function

app.post('/searches', getBooks);


function Books(data){
  let noData = 'No Data Found';
  this.title = (data ? data.title : noData );
  this.author = (data ? data.author : noData );
  this.description = (data ? data.description : noData );
  this.image = (data ? data.image : noData );
}

function getBooks(req, res){
  URL = '';
  return superagent.get(URL)



};

