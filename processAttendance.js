const { MongoClient } = require('mongodb');
const BaseModel = require('./models/BaseModel');
const config = require('./config');

async function processAttendance(eventData) {
    const client = new MongoClient(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      const db = client.db();
      const collection = db.collection('attendance_list');
  
      const { userId, coursesList } = eventData;
  
      if (!coursesList || !Array.isArray(coursesList)) {
        throw new Error('Invalid coursesList');
      }
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
  
      const updatedAttendanceList = await Promise.all(coursesList.map(async (course) => {
        const existingRecord = await collection.findOne({
          userId: userId,
          courseId: course.courseId,
          attendanceDate: { $gte: todayStart.getTime(), $lt: todayEnd.getTime() }
        });
        return {
          ...course,
          isAttendance: !!existingRecord
        };
      }));
  
      return new BaseModel("attendance_processed", updatedAttendanceList);
    } catch (error) {
      console.error('Error processing attendance:', error);
      return new BaseModel("attendance_processed", "", 'Failed to process attendance' );
    } finally {
      await client.close();
    }
  }

module.exports = { processAttendance };