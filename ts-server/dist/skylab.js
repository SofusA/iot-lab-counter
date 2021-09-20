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
app.get('/skylab', (req, res) => {
    res.sendFile(__dirname + '/client/skylab/index.html');
});
io.on('connection', (socket) => {
    console.log('new connection');
});
http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
app.post('/count', (req, res) => {
    const count = (0, count_1.parseCount)(req.body);
    (0, maintenance_1.updateSensor)(count);
    if (count['door'].includes('test')) {
        io.emit('skylab', count['door']);
    }
    res.send({
        response: 'OK'
    });
});
app.post('/heartbeat', (req, res) => {
    (0, maintenance_1.updateHeartbeat)(req.body);
    res.send({
        response: 'OK'
    });
});
app.post('/error', (req, res) => {
    (0, maintenance_1.updateError)(req.body);
    res.send({
        response: 'OK'
    });
});
app.get('/status', (req, res) => {
    (0, maintenance_1.statusPage)().then((result) => {
        res.send(result);
    });
});
//# sourceMappingURL=skylab.js.map