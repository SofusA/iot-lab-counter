import axios from 'axios'

let sendOneCount = (): object => {
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
    }

    if (Math.random() < 0.5) {
        count["rule_name"] = "Exit"
    } else {
        count["rule_name"] = "Enter"
    }
    return count;
};

let sendOne = async () => {
    axios.post('http://127.0.0.1:3000', sendOneCount())
        .then(function (response) {
            console.log("Success");
        })
        .catch(function (error) {
            console.log("Error");
        });
}

setInterval(sendOne, 5000)