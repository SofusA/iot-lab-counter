import sqlite3 from 'sqlite3'
let db = new sqlite3.Database('database.db')

let parseCount = (input: string) => {
    const msgOut = {
        "door": "\'" + input['channel_name'] + "\'",
        "time": new Date(input['event_time']).getTime(),
        ...(input['rule_name'] == "Enter" && { "direction_in": 1 }),
        ...(input['rule_name'] == "Exit" && { "direction_out": 1 })
    };

    sendToDatabase(msgOut);
    return msgOut;
}

let sendToDatabase = (input: object) => {
    const query = "INSERT INTO counterTable(" + Object.keys(input) + ") VALUES(" + Object.values(input) + ")"
    db.run(query)
}

let sample = () => {
    db.each("SELECT * FROM counterTable ORDER BY time DESC LIMIT 10", function (err, row) {
        console.log(row);
    });
}

export { parseCount as parseCount, sample as sample }

