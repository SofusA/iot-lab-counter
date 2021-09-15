"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
let sendOneCount = () => {
    const count = {
        "channel_id": "f590d746-0a72-43e4-beb7-6fa04f978121",
        "channel_name": "skylab;front;revolving",
        "event_name": "Crossed line",
        "event_origin": "Pedestrian",
        "event_time": "2021-09-15T09:55:03.0992892+02:00",
        "event_type": "TripwireCrossed",
        "object_id": 677,
        "rule_id": "974c8bc3-c3be-4698-83ae-720c718df09a",
        "rule_name": "null"
    };
    if (Math.random() < 0.5) {
        count["rule_name"] = "Exit";
    }
    else {
        count["rule_name"] = "Enter";
    }
    return count;
};
let sendOne = () => __awaiter(void 0, void 0, void 0, function* () {
    axios_1.default.post('http://127.0.0.1:5500', sendOneCount())
        .then(function (response) {
        console.log("Success");
    })
        .catch(function (error) {
        console.log("Error");
    });
});
setInterval(sendOne, 5000);
//# sourceMappingURL=app.js.map