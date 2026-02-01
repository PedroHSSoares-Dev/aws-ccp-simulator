// ============================================================================
// CCP Simulator API - Express + MongoDB Backend
// ============================================================================

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/ccp_simulator';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

async function connectDB() {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        db = client.db();
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// ============================================================================
// History Endpoints
// ============================================================================

// Get all exam attempts
app.get('/api/history', async (req, res) => {
    try {
        const attempts = await db.collection('attempts').find().sort({ date: -1 }).toArray();
        res.json(attempts);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Add new exam attempt
app.post('/api/history', async (req, res) => {
    try {
        const attempt = req.body;
        attempt.createdAt = new Date();
        const result = await db.collection('attempts').insertOne(attempt);
        res.status(201).json({ ...attempt, _id: result.insertedId });
    } catch (error) {
        console.error('Error saving attempt:', error);
        res.status(500).json({ error: 'Failed to save attempt' });
    }
});

// Clear all history
app.delete('/api/history', async (req, res) => {
    try {
        await db.collection('attempts').deleteMany({});
        res.json({ message: 'History cleared' });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

// ============================================================================
// Settings Endpoints
// ============================================================================

// Get settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.collection('settings').findOne({ _id: 'user-settings' });
        res.json(settings || {});
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update settings
app.put('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        await db.collection('settings').updateOne(
            { _id: 'user-settings' },
            { $set: { ...settings, updatedAt: new Date() } },
            { upsert: true }
        );
        res.json({ message: 'Settings saved' });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// ============================================================================
// Wrong Answers Tracking
// ============================================================================

// Get wrong answers stats
app.get('/api/wrong-answers', async (req, res) => {
    try {
        const wrongAnswers = await db.collection('wrongAnswers').find().toArray();
        res.json(wrongAnswers);
    } catch (error) {
        console.error('Error fetching wrong answers:', error);
        res.status(500).json({ error: 'Failed to fetch wrong answers' });
    }
});

// Update wrong answer count for a question
app.post('/api/wrong-answers', async (req, res) => {
    try {
        const { questionId, domain, subdomain } = req.body;
        await db.collection('wrongAnswers').updateOne(
            { questionId },
            {
                $inc: { count: 1 },
                $set: { domain, subdomain, lastWrongAt: new Date() }
            },
            { upsert: true }
        );
        res.json({ message: 'Wrong answer tracked' });
    } catch (error) {
        console.error('Error tracking wrong answer:', error);
        res.status(500).json({ error: 'Failed to track wrong answer' });
    }
});

// ============================================================================
// Health Check
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 API server running on http://localhost:${PORT}`);
    });
});
