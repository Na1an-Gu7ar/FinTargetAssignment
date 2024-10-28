const Redis = require('ioredis');
const redis = new Redis();

const taskQueue = {};

const RATE_LIMIT = { second: 1, minute: 20 };

async function addTaskToQueue(user_id, task) {
    const taskCountSecond = await redis.get(`${user_id}_second`) || 0;
    const taskCountMinute = await redis.get(`${user_id}_minute`) || 0;

    if (taskCountSecond < RATE_LIMIT.second && taskCountMinute < RATE_LIMIT.minute) {
        executeTask(user_id, task);
    } else {
        if (!taskQueue[user_id]) taskQueue[user_id] = [];
        taskQueue[user_id].push(task);
    }
}

async function executeTask(user_id, task) {
    await incrementUserRate(user_id);
    task(user_id);
    logTaskCompletion(user_id);
    processTaskQueue(user_id);
}

async function incrementUserRate(user_id) {
    await redis.multi()
        .incr(`${user_id}_second`)
        .expire(`${user_id}_second`, 1)
        .incr(`${user_id}_minute`)
        .expire(`${user_id}_minute`, 60)
        .exec();
}

function processTaskQueue(user_id) {
    if (taskQueue[user_id] && taskQueue[user_id].length > 0) {
        const nextTask = taskQueue[user_id].shift();
        setTimeout(() => executeTask(user_id, nextTask), 1000);
    }
}

function logTaskCompletion(user_id) {
    const log = `${user_id}-task completed at-${Date.now()}\n`;
    require('fs').appendFileSync('task_log.txt', log);
}

module.exports = { addTaskToQueue };
