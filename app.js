const express = require('express');
const cluster = require('cluster');
const os = require('os');
const { processTaskQueue } = require('./taskQueue');

const numCPUs = os.cpus().length;
const app = express();
app.use(express.json());

if (cluster.isMaster) {
    for (let i = 0; i < Math.min(2, numCPUs); i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const taskRouter = require('./taskRouter');
    app.use('/task', taskRouter);

    app.listen(3000, () => {
        console.log(`Worker ${process.pid} started on port 3000`);
    });
}
