const { MongoClient } = require('mongodb');
const BaseModel = require('./models/BaseModel');
const config = require('./config');

async function processCourseAttendance(eventData) {
  const client = new MongoClient(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('attendance_list');

    const { userId, days, selectedCourse } = eventData;
    const { courseId, courseName } = selectedCourse;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    console.log('startDate: ', startDate.getTime(), endDate.getTime());

    // Query the database for entries within the date range
    const records = await collection.find({
      userId: userId,
      courseId: courseId,
      attendanceDate: { $gte: startDate.getTime(), $lt: endDate.getTime() }
    }).toArray();

    console.log('records: ', records);

    // Create a map of the existing records
    const dateMap = new Map();
    records.forEach(record => {
      const dateKey = new Date(record.attendanceDate).setHours(0, 0, 0, 0);
      dateMap.set(dateKey, record);
    });

    // Fill in any missing dates with default entries
    const attendanceList = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = new Date(d).setHours(0, 0, 0, 0);
      if (dateMap.has(dateKey)) {
        attendanceList.push(dateMap.get(dateKey));
      } else {
        // attendanceList.push({
        //   userId: userId,
        //   courseId: courseId,
        //   courseName: courseName,
        //   attendanceDate: new Date(dateKey).getTime(),
        //   isAttendance: false
        // });
      }
    }

    return new BaseModel("attendance_course_processed", attendanceList);
  } catch (error) {
    console.error('Error processing course attendance:', error);
    return new BaseModel("attendance_course_processed", "", 'Failed to process course attendance' );
  } finally {
    await client.close();
  }
}

module.exports = { processCourseAttendance };