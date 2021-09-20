"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Import api handlers
const count_1 = require("./count");
const maintenance_1 = require("./maintenance");
const init_db_1 = require("./init_db");
app.get('/init', (req, res) => {
    res.send('Initiating database');
    (0, init_db_1.init_db)();
});
app.get('/', (req, res) => {
    res.send('Iot-lab counter');
    (0, count_1.sample)();
});
app.post('/count', (req, res) => {
    const count = (0, count_1.parseCount)(req.body);
    (0, maintenance_1.updateSensor)(count);
    // console.log(count)
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
app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app%20copy.js.map