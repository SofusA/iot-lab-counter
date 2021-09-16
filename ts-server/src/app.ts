// Set up server
import express from 'express';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import api handlers
import { parseCount, sample } from './count'
import { updateError, updateHeartbeat, updateSensor, statusPage } from './maintenance';
import { init_db } from './init_db';

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

// serve Skylab
app.get('/skylab', (req, res) => {
  res.sendFile(__dirname + '/client/skylab/index.html');
});

// subscribe new connections
io.on('connection', (socket) => {
  console.log('New connection')
  socket.on('join', room => {
    socket.join(room);
  });
});

// count api
app.post('/count', (req, res) => {
  // parse and put to database
  const count = parseCount(req.body)

  // Update sensorlist
  updateSensor(count)

  // update skylab connections
  if (count['door'].includes('test')) {
    io.to('skylab').emit('update', count['door']);
  }

  // update status connections
  statusPage().then((result) => {
    io.to('status').emit('update', result)
  });

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
  res.sendFile(__dirname + '/client/status/index.html');
});