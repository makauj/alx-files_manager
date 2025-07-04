const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const Queue = require('bull/lib/queue');

const userQueue = new Queue('email sending');

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }
    const usersCollection = dbClient.db.collection('users');
    const existingEmail = await usersCollection.findOne({ email });
    if (existingEmail) {
      response.status(400).json({ error: 'Already exist' });
      return;
    }

    const shaHashedPw = sha1(password);
    const inserted = await usersCollection.insertOne({ email, password: shaHashedPw });
    const userId = inserted.insertedId;
    userQueue.add({ userId });
    response.status(201).json({ id: userId, email });
  }

  static async getMe(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const userObjId = new ObjectID(userId);
    if (userId) {
      const users = dbClient.db.collection('users');
      const existingUser = await users.findOne({ _id: userObjId });
      if (existingUser) {
        response.status(200).json({ id: userId, email: existingUser.email });
      } else {
        response.status(401).json({ error: 'Unauthorized' });
      }
    } else {
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;
