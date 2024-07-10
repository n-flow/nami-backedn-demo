const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const BaseModel = require('./models/BaseModel');

const { insertUser } = require('./RegistrationUser');
const { loginUser } = require('./LoginUser');
const { processAttendance } = require('./processAttendance');
const { processCourseAttendance } = require('./processCourseAttendance');
const { markAttendance } = require('./markAttendance');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});


io.on('connection', (socket) => {
  console.log('a user connected');
  

  socket.on('on_event', async (data) => {
    console.log('on_event_received: ', data);

    try {
        const baseModel = new BaseModel(data.eventName, data.eventData);
        let result = new BaseModel("", "");
        if (baseModel.eventName == "insert_user") {
            result = await insertUser(data.eventData);
        } else if (baseModel.eventName == "login_user") {
            result = await loginUser(data.eventData);
        } else if (baseModel.eventName == "get_today_attendance") {
            result = await processAttendance(data.eventData);
        } else if (baseModel.eventName == "get_attendance_for_course") {
            result = await processCourseAttendance(data.eventData);
        } else if (baseModel.eventName == "mark_attendance") {
            result = await markAttendance(data.eventData);
        }
    
        console.log('on_event_send: ', result);
        socket.emit('on_event', result);
    } catch (error) {
        console.error('Error inserting user:', error);
        socket.emit('on_error', { eventError: 'Failed to return data for this reuest', data: data });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});