import express from 'express';
import { 
  passwordConfig as SQLAuthentication, 
  noPasswordConfig as PasswordlessConfig 
} from './config.js';
import { createDatabaseConnection } from './database.js';

const router = express.Router();
router.use(express.json());

const database = await createDatabaseConnection(PasswordlessConfig);

router.get('/', async (req, res) => {
  try {
    // Return a list of wardens

    const wardens = await database.readAll();
    console.log(`wardens: ${JSON.stringify(wardens)}`);
    res.status(200).json(wardens);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // add a warden
    const warden = req.body;
    console.log(`warden: ${JSON.stringify(warden)}`);
    const rowsAffected = await database.create(warden);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Get the warden with the specified ID
    const wardenId = req.params.id;
    console.log(`wardenId: ${wardenId}`);
    if (wardenId) {
      const result = await database.read(wardenId);
      console.log(`wardens: ${JSON.stringify(result)}`);
      res.status(200).json(result);
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update the warden with the specified ID
    const wardenId = req.params.id;
    console.log(`wardenId: ${wardenId}`);
    const warden = req.body;

    if (wardenId && warden) {
      delete warden.id;
      console.log(`warden: ${JSON.stringify(warden)}`);
      const rowsAffected = await database.update(wardenId, warden);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete the warden with the specified ID
    const wardenId = req.params.id;
    console.log(`wardenId: ${wardenId}`);

    if (!wardenId) {
      res.status(404);
    } else {
      const rowsAffected = await database.delete(wardenId);
      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;