const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()  //.env ar environment varible kaj koranor jnno aita require kora lagey
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express()


//middleware
app.use(cors())
//body diye jei data pai sheita access korar jnno aita use kora hocchey
app.use(express.json())


//connect to mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yz2oh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    //connect to client
    await client.connect();
    // console.log('Connected to MongoDB');
    const serviceCollection=client.db('doctors_portal').collection('services');

    //get services
    app.get('/service',async(req,res)=>{
        const query={};
        const cursor= serviceCollection.find(query);
        const services= await cursor.toArray();
        res.send(services)
    })




  } finally {

  }
}
run().catch(console.dir)

//root url=>'/'
app.get('/', (req, res) => {
    res.send('doctor portal Server running Perfectly !');
  });
  
  //MEWAO LIFE
  
  app.listen(port, () => {
    console.log('Listening to port', port)
  })