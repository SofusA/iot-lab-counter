"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Set up server
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Import api handlers
const count_1 = require("./count");
const maintenance_1 = require("./maintenance");
http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
// serve Skylab
app.get('/skylab', (req, res) => {
    res.sendFile(__dirname + '/client/skylab/index.html');
});
// subscribe new connections
io.on('connection', (socket) => {
    console.log('New connection');
    socket.on('join', room => {
        socket.join(room);
    });
});
// count api
app.post('/count', (req, res) => {
    // parse and put to database
    const count = (0, count_1.parseCount)(req.body);
    // Update sensorlist
    (0, maintenance_1.updateSensor)(count);
    // update skylab connections
    if (count['door'].includes('test')) {
        io.to('skylab').emit('update', count['door']);
    }
    // update status connections
    (0, maintenance_1.statusPage)().then((result) => {
        io.to('status').emit('update', result);
    });
    // respond
    res.send({
        response: 'OK'
    });
});
// heartbeat api
app.post('/heartbeat', (req, res) => {
    (0, maintenance_1.updateHeartbeat)(req.body);
    res.send({
        response: 'OK'
    });
});
// error api
app.post('/error', (req, res) => {
    (0, maintenance_1.updateError)(req.body);
    res.send({
        response: 'OK'
    });
});
// status page
app.get('/status', (req, res) => {
    res.sendFile(__dirname + '/client/status/index.html');
});
//# sourceMappingURL=app.js.map