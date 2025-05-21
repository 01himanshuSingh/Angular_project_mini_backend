const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies

// Connect to MongoDB
mongoose.connect('mongodb+srv://himanshu:37DBCKeksnCIPuat@cluster0.kgrss.mongodb.net/diaryDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Diary Schema & Model
const diarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  entry: { type: String, required: true },
});

const Diary = mongoose.model('Diary', diarySchema);

// Routes

// Get all diary entries
app.get('/api/diaries', async (req, res) => {
  try {
    const diaries = await Diary.find();
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single diary entry by ID
app.get('/api/diaries/:id', async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) return res.status(404).json({ message: 'Diary entry not found' });
    res.json(diary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new diary entry
app.post('/api/diaries', async (req, res) => {
  const diary = new Diary({
    title: req.body.title,
    date: req.body.date,
    entry: req.body.entry,
  });

  try {
    const newDiary = await diary.save();
    res.status(201).json(newDiary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a diary entry
app.put('/api/diaries/:id', async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) return res.status(404).json({ message: 'Diary entry not found' });

    diary.title = req.body.title ?? diary.title;
    diary.date = req.body.date ?? diary.date;
    diary.entry = req.body.entry ?? diary.entry;

    const updatedDiary = await diary.save();
    res.json(updatedDiary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a diary entry
app.delete('/api/diaries/:id', async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const diary = await Diary.findById(id);
    if (!diary) return res.status(404).json({ message: 'Diary entry not found' });

   await Diary.deleteOne({ _id: diary._id });
    res.json({ message: 'Diary entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
