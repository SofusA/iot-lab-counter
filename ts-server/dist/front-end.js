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
exports.frontPage = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
let db = new sqlite3_1.default.Database('database.db');
const getFirstVisitor = (location) => {
    return new Promise((resolve, reject) => {
        const three = new Date();
        three.setHours(3, 0, 0, 0);
        const query = 'SELECT time from counterTable WHERE instr(door, "' + location + '") > 0 AND time > ' + three.getTime() + ' ORDER BY time ASC LIMIT 1';
        getQuery(query, 'time').then(r => resolve(r));
    });
};
console.log('Reset time inititated');
let resetTime = new Date();
resetTime.setHours(3, 0, 0, 0);
function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
const getCurrentVisitors = (location) => {
    return new Promise((resolve, reject) => {
        // Handle the reset timer
        const now = new Date();
        // Hvis ikke blevet reset i dag og klokken er over 03, reset til i dag klokken 03
        if (!sameDay(now, resetTime) && now.getHours() > 3) {
            resetTime = now;
            resetTime.setHours(3, 0, 0, 0);
            console.log('resetTime reset to: ' + resetTime);
        }
        const query = 'SELECT SUM(direction_in)-SUM(direction_out) from counterTable WHERE instr(door, "' + location + '") > 0 AND time > ' + resetTime.getTime();
        getQuery(query, 'SUM(direction_in)-SUM(direction_out)').then(r => {
            if (r < 0) {
                resetTime = now; // reset the time
                console.log('resetTime was reset, due to below 0 visitors. Measured value was: ' + r + '. New reset time: ' + resetTime);
                resolve(0);
            }
            else {
                resolve(r);
            }
            // resolve((r > 0) ? r : 0) // return 0 if below 0
        });
    });
};
const getTodayVisitors = (location) => {
    return new Promise((resolve, reject) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const query = 'SELECT SUM(direction_in) from counterTable WHERE instr(door, "' + location + '") > 0 AND time > ' + today.getTime();
        getQuery(query, 'SUM(direction_in)').then(r => resolve(r));
    });
};
const getWeekVisitors = (location) => {
    return new Promise((resolve, reject) => {
        const curr = new Date(); // get current date
        let first = curr.getDate() - curr.getDay() + 1; // First day is the day of the week - the day of the week
        let last = first + 6; // last day is the first day + 6
        first = first - curr.getDate();
        last = last - curr.getDate();
        let firstday = new Date();
        firstday.setDate(firstday.getDate() + first);
        firstday.setHours(0, 0, 0, 0);
        let lastday = new Date();
        lastday.setDate(lastday.getDate() + last);
        lastday.setHours(24, 0, 0, 0);
        const query = 'SELECT SUM(direction_in) from counterTable WHERE instr(door, "' + location + '") > 0 AND time > ' + firstday.getTime() + ' AND time < ' + lastday.getTime();
        getQuery(query, 'SUM(direction_in)').then(r => resolve(r));
    });
};
const getMonthVisitors = (location) => {
    return new Promise((resolve, reject) => {
        var monthDate = new Date(), y = monthDate.getFullYear(), m = monthDate.getMonth();
        var firstday = new Date(y, m, 1);
        var lastday = new Date(y, m + 1, 0);
        const query = 'SELECT SUM(direction_in) from counterTable WHERE instr(door, "' + location + '") > 0 AND time > ' + firstday.getTime() + ' AND time < ' + lastday.getTime();
        getQuery(query, 'SUM(direction_in)').then(r => resolve(r));
    });
};
const getYearVisitors = (location) => {
    return new Promise((resolve, reject) => {
        let year = new Date().getFullYear();
        const thisYear = new Date(year, 0, 1);
        const nextYear = new Date(year + 1, 0, 1);
        const query = 'SELECT SUM(direction_in) from counterTable WHERE instr(door, "' + location + '") > 0 AND time > ' + thisYear.getTime() + ' AND time < ' + nextYear.getTime();
        getQuery(query, 'SUM(direction_in)').then(r => resolve(r));
    });
};
const buildIntervalQuery = (location) => {
    const interval = [{ start: 0, end: 12 }, { start: 12, end: 17 }, { start: 17, end: 24 }];
    const start = new Date();
    const end = new Date();
    // Build query
    let query = [];
    for (const timeslot of interval) {
        end.setHours(timeslot.end, 0, 0, 0);
        start.setHours(timeslot.start, 0, 0, 0);
        query.push("SELECT SUM(direction_in) from counterTable WHERE time > " + start.getTime() + " AND time < " + end.getTime());
    }
    return query;
};
const getQuery = (query, output) => {
    return new Promise((resolve, reject) => {
        db.each(query, function (err, rows) {
            resolve(rows[output]);
        });
    });
};
const frontPage = (location) => __awaiter(void 0, void 0, void 0, function* () {
    const out = {
        firstVisitor: yield getFirstVisitor(location),
        currentVisitors: yield getCurrentVisitors(location),
        todayVisitors: yield getTodayVisitors(location),
        weekVisitors: yield getWeekVisitors(location),
        monthVisitors: yield getMonthVisitors(location),
        todayMorning: yield getQuery(buildIntervalQuery(location)[0], 'SUM(direction_in)'),
        todayAfternoon: yield getQuery(buildIntervalQuery(location)[1], 'SUM(direction_in)'),
        todayNight: yield getQuery(buildIntervalQuery(location)[2], 'SUM(direction_in)'),
        yearVisitors: yield getYearVisitors(location)
    };
    return out;
});
exports.frontPage = frontPage;
//# sourceMappingURL=front-end.js.map