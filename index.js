const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()  //.env ar environment varible kaj koranor jnno aita require kora lagey
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5500;
const app = express()


//middleware
app.use(cors())
//client thekey data server a ashbey req.body diye get korar jnno we have to use this middleware
app.use(express.json())


//connect to mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yz2oh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    //connect to client
    await client.connect();
    // console.log('Connected to MongoDB');
    const serviceCollection = client.db('doctors_portal').collection('services');
    const bookingCollection = client.db('doctors_portal').collection('bookings');

    /**
    * API Naming Convention
    * app.get('/booking') // get all bookings in this collection. or get more than one or by filter
    * app.get('/booking/:id') // get a specific booking 
    * app.post('/booking') // add a new booking
    * app.patch('/booking/:id) //update a specific booking
    * app.delete('/booking/:id) // delete a sepecific booking
   */

    //get services API
    app.get('/service', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    })
    // Warning: This is not the proper way to query multiple collection. 
    // After learning more about mongodb. use aggregate, lookup, pipeline, match, group
    app.get('/available', async (req, res) => {
      const date = req.query.date ;  //date ta query hishabey client side theke ashbey
      console.log(date)
      // step 1:  get all services
      const services = await serviceCollection.find().toArray();

      // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
      const query = { date: date };
      const bookings = await bookingCollection.find(query).toArray();

      // step 3: for each service
      services.forEach(service => {
        // step 4: find bookings for that service. output: [{}, {}, {}, {}]
        const serviceBookings = bookings.filter(book => book.treatment === service.name);
        // step 5: select slots for the service Bookings: ['', '', '', '']
        const bookedSlots = serviceBookings.map(book => book.slot);
        // step 6: select those slots that are not in bookedSlots
        const available = service.slots.filter(slot => !bookedSlots.includes(slot));
        //step 7: set available to slots to make it easier 
        service.slots  = available;
      });

     /**
     * API Naming Convention
     * app.get('/booking') // get all bookings in this collection. or get more than one or by filter
     * app.get('/booking/:id') // get a specific booking 
     * app.post('/booking') // add a new booking
     * app.patch('/booking/:id) //update a specific booking
     * app.delete('/booking/:id) // delete a sepecific booking
    */


      res.send(services);
    })

    //Task: same user jeno same time a same date a onno treatment ar booking kortey na parey sheitar query
    //patient booking info post to DB API
  //product increase or decrease ai concept a kora jaitey parey
    app.post('/booking', async (req, res) => {
      const booking = req.body;  //client side thekey patient ar info pabo and sheita req.body diye get korbo server side a
      //console.log(booking)
      //same date a particular ekta service ar booking 1 bar e kortey parbey user(time slot different dileo kaj hobey na)
      const query = { treatment: booking.treatment,slot:booking.slot, date: booking.date, /*slot:booking.slot,*/ patient_name: booking.patient_name };
      //treatment,date,patient_name ai koyta jinish ar opor builded query ar opor base korey data find kora hocchey and shei data jodi DB tey thakey tahley sheita exits a store hobey
      const exists = await bookingCollection.findOne(query);
      //patient jodi booking korey thakye already tahley ar new booking kortey dibo na
      if (exists) {
        return res.send({ success: false, booking: exists })
      }
      const insertedBooking = await bookingCollection.insertOne(booking);
      return res.send({ success: true, insertedBooking });
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