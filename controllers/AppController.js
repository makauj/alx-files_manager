const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  // GET /status
  static getStatus(req, res) {
    const redisstatus = redisClient.isAlive();
    const dbstatus = dbClient.isAlive();
    res.status(200).send({ redis: redisstatus, db: dbstatus });
  }

  // GET /stats
  static async getStats(req, res) {
    const userNum = await dbClient.nbUsers();
    const fileNum = await dbClient.nbFiles();

    res.status(200).send({
      users: userNum,
      files: fileNum,
    });
  }
}

module.exports = AppController;
