require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: 'https://chill-gamer-2fc8d.web.app', // Replace with your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2oi6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (uncomment these lines)
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("gameDB");
    const gamesCollection = database.collection("games");
    const favoriteCollection = database.collection("favorite");

    app.get('/allgames', async (req, res) => {
        const cursor = gamesCollection.find({});
        const games = await cursor.toArray();
        res.send(games);
    });

    // Get a game by id
    app.get('/games/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const game = await gamesCollection.findOne(query);
        res.send(game);
    });

    // Search games and get all matched games
    app.get('/searchgames/:search', async (req, res) => {
        const search = req.params.search;
        const query = { title: { $regex: search, $options: 'i' } };
        const cursor = gamesCollection.find(query);
        const games = await cursor.toArray();
        res.send(games);
    });

    // Update game by id
    app.put('/updategames/:id', async (req, res) => {
        const id = req.params.id;
        const updatedGame = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: updatedGame };
        const result = await gamesCollection.updateOne(filter, updateDoc);
        res.json(result);
    });

    // Add game to favorite, will receive game id and user email
    app.post('/addtofavorite', async (req, res) => {
        const favorite = req.body;
        const result = await favoriteCollection.insertOne(favorite);
        res.send(result);
    });

    // Get all favorite games by user email
    app.get('/getfavorite/:email', async (req, res) => {
        const email = req.params.email;
        // Query the favoriteCollection by user email
        const query = { userEmail: email };
        const cursor = favoriteCollection.find(query);
        const favorite = await cursor.toArray();
        // Form the gameId array and ensure correct conversion
        const gameIds = favorite.map(fav => new ObjectId(fav.movieId)); // Correctly using fav.movieId
        // Query the gamesCollection using the mapped gameIds
        const games = await gamesCollection.find({ _id: { $in: gameIds } }).toArray();
        res.send(games);
    });

    // Delete game from favorite for a user
    app.delete('/deletefavorite/:email/:gameId', async (req, res) => {
        const email = req.params.email;
        const gameId = req.params.gameId;
        console.log(email, gameId);
        const query = { userEmail: email, gameId: gameId };
        const result = await favoriteCollection.deleteOne(query);
        console.log('delete result', result);
        res.send(result);
    });

    // Get 6 games for feature by top ratings
    app.get('/getfeaturegames', async (req, res) => {
        const cursor = gamesCollection.find({}).sort({ rating: -1 }).limit(6);
        const games = await cursor.toArray();
        res.send(games);
    });

    // Delete game
    app.delete('/games/:id', async (req, res) => {
        console.log('delete hit');
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await gamesCollection.deleteOne(query);
        res.send(result);
    });

    app.post('/user/addgames', async (req, res) => {
        const game = req.body;
        const result = await gamesCollection.insertOne(game);
        res.send(result);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('chill gamer is running');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
