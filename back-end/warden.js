import express from 'express';

const router = express.Router();
router.use(express.json());

// Get all wardens
router.get('/', async (req, res) => {
  try {
    const wardens = await req.app.locals.database.readAll();
    res.status(200).json(wardens);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// Add a warden
router.post('/', async (req, res) => {
  try {
    const warden = req.body;
    const rowsAffected = await req.app.locals.database.create(warden);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// Get a warden by ID
router.get('/:id', async (req, res) => {
  try {
    const warden = await req.app.locals.database.read(req.params.id);
    warden ? res.status(200).json(warden) : res.status(404).json({ error: "Warden not found" });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// Update a warden
router.put('/:id', async (req, res) => {
  try {
    const rowsAffected = await req.app.locals.database.update(req.params.id, req.body);
    res.status(200).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// Delete a warden
router.delete('/:id', async (req, res) => {
  try {
    const rowsAffected = await req.app.locals.database.delete(req.params.id);
    res.status(204).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
