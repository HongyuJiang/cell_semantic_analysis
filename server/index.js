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

  const MongoClient = require('mongodb').MongoClient;//创建服务器实例
  const uri = "mongodb+srv://lanmiemie:zly3885251@mobiledata.ez0ez.mongodb.net/MobileData?retryWrites=true&w=majority";
  
  let data = Object.keys(req.body)[0];
  //console.log("data",data)

  let persons = JSON.parse(data)['persons']//和userembvis中的selected_persons_dict是一样的

  //console.log("persons",persons)

  MongoClient.connect(uri, { useNewUrlParser: true }).then((conn) => {    //与网上的mongdb服务器连接

      let fake_persons = {"13018149529": 1}

      const db = conn.db("cotton");//创建数据库的实例
      // 增加
      db.collection("heihei").find({}, {fields: persons}).toArray().then((arr) => {
         
          //console.log("arr",arr)

          ret_data = arr[0]
          focused_persons = ret_data

          res.sendStatus(200)//不返回数据 发送状态码200表示收到

      }).catch((err) => {
        console.log(err);
      });

  }).catch((err) => {
      console.log(err);
    });

});//收到前端发送的selected_persons_dict（key为选中的person value为1），查询的结果为focused_persons，内部为用户的相关基站及其各个时段的访问次数，不返回结果

app.post('/cells', (req, res) => {

  let hourCounter = {}

  let data = req.body;//对象
  //console.log("houtai",data)

  let cells = data['cells']//取对象中的数组
  //console.log("cells",cells)

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

  res.status(200).send(JSON.stringify(hourCounter))//web服务器发送数据时，数据必须为字符串
});//收到前端发送的selected_cell_list（选中的基站编号），查询结果为聚类视图选中的用户们所涉及的相关基站在不同时间的使用次数

const server = app.listen(4000, function () {


  const host = 'server.address().address'
  const port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})