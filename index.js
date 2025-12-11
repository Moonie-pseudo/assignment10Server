const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// CORS: allow all necessary methods from React client
app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://mun:tQrT5Nkh0C956JPr@cluster0.f0f0yek.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db('Pets-db');
    const petsCollection = db.collection('Pets');
    const ordersCollection = db.collection('Orders');

    // ================= Pets Routes =================

    // GET all pets
    app.get('/pets', async (req, res) => {
      try {
        const pets = await petsCollection.find().toArray();
        res.send(pets);
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // GET single pet by ID
    app.get('/pets/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const pet = await petsCollection.findOne({ _id: new ObjectId(id) });
        if (!pet) return res.status(404).send({ success: false, message: 'Pet not found' });
        res.send(pet);
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // POST new pet
    app.post('/pets', async (req, res) => {
      try {
        const listing = req.body;
        const result = await petsCollection.insertOne(listing);
        res.send({ success: true, data: result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // PUT update pet
    app.put('/pets/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await petsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        if (result.matchedCount === 0) return res.status(404).send({ success: false, message: 'Pet not found' });
        res.send({ success: true, message: 'Listing updated' });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // DELETE a pet
    app.delete('/pets/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await petsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).send({ success: false, message: 'Pet not found' });
        res.send({ success: true, message: 'Listing deleted' });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // ================= Orders Routes =================

    // POST new order
    app.post('/orders', async (req, res) => {
      try {
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.send({ success: true, data: result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // GET all orders
    app.get('/orders', async (req, res) => {
      try {
        const orders = await ordersCollection.find().toArray();
        res.send(orders);
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB successfully!");
    
  } finally {
    // Keep client connected while server is running
  }
}
run().catch(console.dir);

// ================= Basic Routes =================
app.get('/', (req, res) => res.send('HELLO WORLD!'));
app.get('/home', (req, res) => res.send('I am home'));

// Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
