const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
let db;

MongoClient.connect(MONGODB_URI)
  .then(client => {
    db = client.db('taskdb');
    console.log('✅ Connecté à Cosmos DB');
  })
  .catch(err => console.error('❌ Erreur connexion MongoDB:', err));

app.get('/api/tasks', async (req, res) => {
  const tasks = await db.collection('tasks').find().toArray();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const newTask = { text: req.body.text, completed: false, createdAt: new Date() };
  const result = await db.collection('tasks').insertOne(newTask);
  res.json({ ...newTask, _id: result.insertedId });
});

app.put('/api/tasks/:id', async (req, res) => {
  const { ObjectId } = require('mongodb');
  const task = await db.collection('tasks').findOne({ _id: new ObjectId(req.params.id) });
  if (task) {
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { completed: !task.completed } }
    );
    res.json({ ...task, completed: !task.completed });
  } else {
    res.status(404).send('Tâche introuvable');
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { ObjectId } = require('mongodb');
  await db.collection('tasks').deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});