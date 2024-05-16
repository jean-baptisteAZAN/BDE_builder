const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({ origin: 'http://192.168.0.14:5173' }));

const serviceAccount = require('./firebase-key.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(bodyParser.json());

app.post("/", (req, res) => {
  res.send("ALORS ?");
});

app.get("/api/userinfo", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Récupérer les informations de l'utilisateur depuis Firestore
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();

    res.json(userData);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = app;
