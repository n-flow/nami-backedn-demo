const { MongoClient } = require('mongodb');
const User = require('./models/UserModel');
const BaseModel = require('./models/BaseModel');
const config = require('./config');

async function insertUser(user) {
  const client = new MongoClient(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('User:  ', user);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('users');

    const existingUser = await collection.findOne({ userId: user.userId });
    if (existingUser) {
      console.log('User already registered');
      return new BaseModel("user_inserted", "", 'User already registered' );
    }

    const userData = new User(user.name, user.userId, user.password, user.professorCode);
    console.log('UserData:  ', userData);
    const insertResult = await collection.insertOne(userData);
    if (insertResult.insertedId) {
        const insertedUser = await collection.findOne({ _id: insertResult.insertedId });
        const baseModel = new BaseModel("user_inserted", insertedUser);
        console.log('User Insert:  ', baseModel);
        return baseModel;
      } else {
        console.log('Insert failed');
        return new BaseModel("user_inserted", "", 'Failed to insert user' );
      }
  } finally {
    await client.close();
  }
}

module.exports = { insertUser };