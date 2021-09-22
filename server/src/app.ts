// Set up server
import express from 'express';
import helmet from 'helmet';
import path from 'path'

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')))


// Import api handlers
import { parseCount, sample } from './count'
import { updateError, updateHeartbeat, updateSensor, statusPage } from './maintenance';
import { init_db } from './init_db';
import { frontPage } from './front-end';

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
  socket.on('join', (r: string) => {
    const site = r.split('/')[0]
    const location = r.split('/')[1] || site

    // console.log('New ' + site + ' : ' + location)

    socket.join(r);

    // update status connections
    if (location === 'status') {
      // console.log('New status connection')
      statusPage().then((result) => {
        socket.emit('update', result)
      });
    }

    // update front-end connections
    if (site === 'front') {
      // console.log('New connection update for: ' + location)
      frontPage(location).then((result) => {
        socket.emit('update', result)
      });
    }
  });
});

// count api
app.post('/count', (req, res) => {
  // parse and put to database
  const count = parseCount(req.body)

  // Update sensorlist
  updateSensor(count)

  
  let rooms = [...io.of("/").adapter.rooms.keys()];
  for (const room of rooms) {

    // update front-ends
    if (room.includes('front') && room.includes(count['location'])) { // Push to all 'front' rooms where this count is related to.
      frontPage(count['location']).then((result) => {
        io.to('front/' + count['location']).emit('update', result);
      });
    }

    // update status connections
    if (room.includes('status')) { // Push to all 'status'
      statusPage().then((result) => {
        io.to('tool/status').emit('update', result)
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
  updateHeartbeat(req.body)
  res.send({
    response: 'OK'
  });
});

// error api
app.post('/error', (req, res) => {
  updateError(req.body)
  res.send({
    response: 'OK'
  });
});

// status page
app.get('/status', (req, res) => {
  res.sendFile(__dirname + '/client/status.html');
});