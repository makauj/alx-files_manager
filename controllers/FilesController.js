/* eslint-disable-next-line no-unused-vars */
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  // ...postUpload remains unchanged

  // GET /files/:id
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let file;
    try {
      file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
      });
    } catch (err) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!file) return res.status(404).json({ error: 'Not found' });

    return res.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  // GET /files
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;

    const query = {
      userId: new ObjectId(userId),
      parentId: parentId === 0 ? 0 : new ObjectId(parentId),
    };

    try {
      const files = await dbClient.db.collection('files')
        .aggregate([
          { $match: query },
          { $skip: page * 20 },
          { $limit: 20 },
          {
            $project: {
              _id: 1,
              userId: 1,
              name: 1,
              type: 1,
              isPublic: 1,
              parentId: 1,
            },
          },
        ])
        .toArray();

      const response = files.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));

      return res.status(200).json(response);
    } catch (err) {
      console.error('Error in getIndex:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /files/:id/publish
  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
      });

      if (!file) return res.status(404).json({ error: 'Not found' });

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: true } },
      );

      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: true,
        parentId: file.parentId,
      });
    } catch (err) {
      console.error('putPublish error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /files/:id/unpublish
  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
      });

      if (!file) return res.status(404).json({ error: 'Not found' });

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: false } },
      );

      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: false,
        parentId: file.parentId,
      });
    } catch (err) {
      console.error('putUnpublish error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = FilesController;
