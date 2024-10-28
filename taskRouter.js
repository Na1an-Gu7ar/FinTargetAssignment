const express = require('express');
const { addTaskToQueue } = require('./taskQueue');

const router = express.Router();

router.post('/', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).send('User ID is required');

    const task = async (id) => {
        console.log(`${id}-task completed at-${Date.now()}`);
    };

    addTaskToQueue(user_id, task);
    res.status(202).send('Task queued');
});

module.exports = router;
