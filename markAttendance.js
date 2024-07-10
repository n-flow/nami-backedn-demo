const { MongoClient } = require('mongodb');
const BaseModel = require('./models/BaseModel');
const config = require('./config');

async function markAttendance(eventData) {
  const client = new MongoClient(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('attendance_list');

    const { userId, selectedCourse } = eventData;
    const { courseId, courseName, attendanceDate, isAttendance } = selectedCourse;

    const attendanceTime = new Date(attendanceDate);
    const startHour = 7;
    const endHour = 19; // 7 PM

    if (attendanceTime.getHours() >= startHour && attendanceTime.getHours() < endHour) {
      const attendanceRecord = {
        userId,
        courseId,
        courseName,
        attendanceDate,
        isAttendance,
      };

      const insertResult = await collection.insertOne(attendanceRecord);

      if (insertResult.insertedId) {
        return new BaseModel("attendance_marked", attendanceRecord, "", 1);
      } else {
        return new BaseModel("attendance_marked", "", 'Insert failed');
      }
    } else {
      return new BaseModel("attendance_marked", "", 'Attendance can only be marked between 7 AM and 7 PM', 100);
    }

  } catch (error) {
    console.error('Error marking attendance:', error);
    return new BaseModel("attendance_marked", "", 'Failed to mark attendance' );
  } finally {
    await client.close();
  }
}

module.exports = { markAttendance };