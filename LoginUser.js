const { MongoClient } = require('mongodb');
const User = require('./models/UserModel');
const BaseModel = require('./models/BaseModel');
const config = require('./config');

async function loginUser(user) {
  const client = new MongoClient(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('User:  ', user);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('users');

    const existingUser = await collection.findOne({ userId: user.userId, password: user.password });
    if (!existingUser) {
      console.log('User not found');
      return new BaseModel("user_logged_in", "", 'User not found' );
    } else {
        console.log('User found: ', existingUser);
        return new BaseModel("user_logged_in", existingUser);
    }
  } finally {
    await client.close();
  }
}

module.exports = { loginUser };