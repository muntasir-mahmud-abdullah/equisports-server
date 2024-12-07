const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//#middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.werzz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const equipmentsCollection = client
      .db("equipmentsDB")
      .collection("equipments");
    //show created data to client
    app.get("/equipments", async (req, res) => {
      const cursor = equipmentsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/equipments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentsCollection.findOne(query);
      res.send(result);
    });
    //receive in server from client
    app.post("/equipments", async (req, res) => {
      const newEquipment = req.body;
      console.log(newEquipment);
      const result = await equipmentsCollection.insertOne(newEquipment);
      res.send(result);
    });
    app.put("/equipments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedEquipment = req.body;
      const Equipment = {
        $set: {
          name: updatedEquipment.name,
          category: updatedEquipment.category,
          image: updatedEquipment.image,
          description: updatedEquipment.description,
          price: updatedEquipment.price,
          rating: updatedEquipment.rating,
          customization: updatedEquipment.customization,
          processingTime: updatedEquipment.processingTime,
          stockStatus: updatedEquipment.stockStatus,
        },
      };
      const result = await equipmentsCollection.updateOne(
        filter,
        Equipment,
        options
      );
      res.send(result);
    });
    app.delete("/equipments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("equisports server is running");
});

app.listen(port, () => {
  console.log(`equisports server is running on port:${port}`);
});
