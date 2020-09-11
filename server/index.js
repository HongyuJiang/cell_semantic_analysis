const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  res.header('Access-Control-Allow-Credentials', true);
  //res.header("Content-Type", "application/json;");
  next();
});

let focused_persons = []

app.post('/users', (req, res) => {

  const MongoClient = require('mongodb').MongoClient;
  const uri = "mongodb+srv://lanmiemie:zly3885251@mobiledata.ez0ez.mongodb.net/MobileData?retryWrites=true&w=majority";
  
  let data = Object.keys(req.body)[0];

  let persons = JSON.parse(data)['persons']

  //console.log(persons)

  MongoClient.connect(uri, { useNewUrlParser: true }).then((conn) => {

      let fake_persons = {"13018149529": 1}

      const db = conn.db("cotton");
      // 增加
      db.collection("heihei").find({}, {fields: persons}).toArray().then((arr) => {
         
          //console.log(arr)

          ret_data = arr[0]

          focused_persons = ret_data

          res.sendStatus(200)

      }).catch((err) => {
        console.log(err);
      });

  }).catch((err) => {
      console.log(err);
    });

});

app.post('/cells', (req, res) => {

  let hourCounter = {}

  let data = req.body;

  let cells = data['cells']

  let cell_dict = {}

  cells.forEach(function(cell){

    cell_dict[cell] = 1
  })

  for (person in focused_persons){

    for (cell in focused_persons[person]){

      if(cell_dict[cell] != undefined){

        for (hour in focused_persons[person][cell]){

          if (hourCounter[hour] != undefined){

            hourCounter[hour] += +focused_persons[person][cell][hour]
          }
          else{

            hourCounter[hour] = +focused_persons[person][cell][hour]
          }
        }
      }
    }
  }

  //console.log(hourCounter)

  res.status(200).send(JSON.stringify(hourCounter))
});

const server = app.listen(4000, function () {


  const host = 'server.address().address'
  const port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})