"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Set up server
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/static', express_1.default.static(path_1.default.join(__dirname, 'public')));
// Import api handlers
const count_1 = require("./count");
const maintenance_1 = require("./maintenance");
const front_end_1 = require("./front-end");
http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
// serve Skylab
app.get('/skylab', (req, res) => {
    res.sendFile(__dirname + '/client/skylab.html');
});
// serve ITU
app.get('/itu', (req, res) => {
    res.sendFile(__dirname + '/client/itu.html');
});
// serve test
app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/client/test.html');
});
// subscribe new connections
io.on('connection', (socket) => {
    socket.on('join', (r) => {
        const site = r.split('/')[0];
        const location = r.split('/')[1] || site;
        // console.log('New ' + site + ' : ' + location)
        socket.join(r);
        // update status connections
        if (location === 'status') {
            // console.log('New status connection')
            (0, maintenance_1.statusPage)().then((result) => {
                socket.emit('update', result);
            });
        }
        // update front-end connections
        if (site === 'front') {
            // console.log('New connection update for: ' + location)
            (0, front_end_1.frontPage)(location).then((result) => {
                socket.emit('update', result);
            });
        }
    });
});
// count api
app.post('/count', (req, res) => {
    // parse and put to database
    const count = (0, count_1.parseCount)(req.body);
    // Update sensorlist
    (0, maintenance_1.updateSensor)(count);
    let rooms = [...io.of("/").adapter.rooms.keys()];
    for (const room of rooms) {
        // update front-ends
        if (room.includes('front') && room.includes(count['location'])) { // Push to all 'front' rooms where this count is related to.
            (0, front_end_1.frontPage)(count['location']).then((result) => {
                io.to('front/' + count['location']).emit('update', result);
            });
        }
        // update status connections
        if (room.includes('status')) { // Push to all 'status'
            (0, maintenance_1.statusPage)().then((result) => {
                io.to('tool/status').emit('update', result);
            });
        }
    }
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
    res.sendFile(__dirname + '/client/status.html');
});
//# sourceMappingURL=app.js.map