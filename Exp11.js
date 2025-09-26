// server.js

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// In-memory data store (an array of card objects)
let cards = [
  { id: 1, suit: 'Hearts', value: 'Ace' },
  { id: 2, suit: 'Spades', value: 'King' },
  { id: 3, suit: 'Diamonds', value: 'Queen' },
];

// A simple counter to generate unique IDs for new cards
let nextId = 4;

// --- API Endpoints ---

// GET /cards - Retrieve all cards
app.get('/cards', (req, res) => {
  res.status(200).json(cards);
});

// GET /cards/:id - Retrieve a specific card by its ID
app.get('/cards/:id', (req, res) => {
  const cardId = parseInt(req.params.id, 10);
  const card = cards.find(c => c.id === cardId);

  if (card) {
    res.status(200).json(card);
  } else {
    res.status(404).json({ message: 'Card not found' });
  }
});

// POST /cards - Add a new card to the collection
app.post('/cards', (req, res) => {
  const { suit, value } = req.body;

  // Basic validation
  if (!suit || !value) {
    return res.status(400).json({ message: 'Suit and value are required.' });
  }

  const newCard = {
    id: nextId++,
    suit: suit,
    value: value,
  };

  cards.push(newCard);
  res.status(201).json(newCard);
});

// DELETE /cards/:id - Remove a card from the collection by its ID
app.delete('/cards/:id', (req, res) => {
  const cardId = parseInt(req.params.id, 10);
  const cardIndex = cards.findIndex(c => c.id === cardId);

  if (cardIndex !== -1) {
    cards.splice(cardIndex, 1);
    res.status(200).json({ message: 'Card deleted successfully' });
  } else {
    res.status(404).json({ message: 'Card not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});