"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sample = exports.parseCount = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
let db = new sqlite3_1.default.Database('database.db');
let parseCount = (input) => {
    const msgOut = Object.assign(Object.assign({ "door": "\'" + input['channel_name'] + "\'", "time": new Date(input['event_time']).getTime() }, (input['rule_name'] == "Enter" && { "direction_in": 1 })), (input['rule_name'] == "Exit" && { "direction_out": 1 }));
    sendToDatabase(msgOut);
    msgOut['location'] = input['channel_name'].split(';')[0];
    console.log('New measurement: ' + input['channel_name'] + ' → ' + input['rule_name']);
    return msgOut;
};
exports.parseCount = parseCount;
let sendToDatabase = (input) => {
    const query = "INSERT INTO counterTable(" + Object.keys(input) + ") VALUES(" + Object.values(input) + ")";
    db.run(query);
};
let sample = () => {
    db.each("SELECT * FROM counterTable ORDER BY time DESC LIMIT 10", function (err, row) {
        console.log(row);
    });
};
exports.sample = sample;
//# sourceMappingURL=count.js.map