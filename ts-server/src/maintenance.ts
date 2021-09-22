let errorLog = {}

import sqlite3 from 'sqlite3'
let db = new sqlite3.Database('database.db')

let updateHeartbeat = (input: string) => {
    const query = 'UPDATE sensorList SET heartbeat = ' + new Date().getTime() + ' WHERE instr(sensor, "' + input['door'].replace(/['"]+/g, '') + '")'
    db.run(query)
}

let updateError = (input: object) => {
    const error = {
        time: new Date().getTime(),
        door: input['channel_name'],
        event: input['event_name']
    }
    errorLog[error.door] = error
}

let updateSensor = (input: object) => {
    const query = 'UPDATE sensorList set lastMsg = ' + input['time'] + ' WHERE instr(sensor, "' + input['door'].replace(/['"]+/g, '') + '")'
    db.run(query)
}


let getSensorList = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * from sensorList', function (err, rows) {
            // console.log(rows)
            resolve(rows)
        })
    })
}

const statusPage = async () => {
    return await getSensorList();
}

export { updateHeartbeat, updateError, updateSensor, statusPage }
