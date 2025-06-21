/* eslint-disable no-return-await */
const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const dbUser = process.env.DB_DATABASE || 'file_manager';

    const uri = `mondodb://${dbUser}@${host}:${port}/file_manager`;
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.dbUser = dbUser;
    this.connected = false;

    this.client.connect()
      .then(() => {
        this.connected = true;
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    const db = this.client.db(this.dbUser);
    const usersCollection = db.collection('users');
    return await usersCollection.countDocuments();
  }

  async nbFiles() {
    if (!this.connected) return 0;
    try {
      return await this.db.collection('files').countDocuments();
    } catch (err) {
      console.error('Error counting files:', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
