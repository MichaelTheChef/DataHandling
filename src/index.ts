import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';

const app = express();
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017';
const dbName = 'database-api';
const collectionName = 'databases';

app.post('/databases', async (req: Request, res: Response) => {
  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db(dbName);
    const database = {
      id: uuidv4(),
      data: [],
    };
    await db.collection(collectionName).insertOne(database);
    client.close();
    res.status(201).json({ id: database.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/databases/:id', async (req: Request, res: Response) => {
  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db(dbName);
    const database = await db.collection(collectionName).findOne({ id: req.params.id });
    client.close();
    if (!database) {
      res.status(404).json({ error: 'Database not found' });
    } else {
      res.status(200).json({ data: database.data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/databases/:id/data', async (req: Request, res: Response) => {
  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db(dbName);
    const database = await db.collection(collectionName).findOne({ id: req.params.id });
    if (!database) {
      res.status(404).json({ error: 'Database not found' });
    } else {
      const newData = req.body;
      database.data.push(newData);
      await db.collection(collectionName).updateOne({ id: req.params.id }, { $set: { data: database.data } });
      client.close();
      res.status(201).json({ message: 'Data stored in the database' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/databases/:id/data/:dataId', async (req: Request, res: Response) => {
  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db(dbName);
    const database = await db.collection(collectionName).findOne({ id: req.params.id });
    if (!database) {
      res.status(404).json({ error: 'Database not found' });
    } else {
      const dataId = req.params.dataId;
      const newData = req.body;
      const dataIndex = database.data.findIndex((data: any) => data.id === dataId);
      if (dataIndex === -1) {
        res.status(404).json({ error: 'Data not found' });
      } else {
        database.data[dataIndex] = { ...database.data[dataIndex], ...newData };
        await db.collection(collectionName).updateOne({ id: req.params.id }, { $set: { data: database.data } });
        client.close();
        res.status(200).json({ message: 'Data updated' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/databases/:id/data/:dataId', async (req: Request, res: Response) => {
  try {
    const client = await MongoClient.connect(mongoURI);
    const db = client.db(dbName);
    const database = await db.collection(collectionName).findOne({ id: req.params.id });
    if (!database) {
      res.status(404).json({ error: 'Database not found' });
    } else {
      const dataId = req.params.dataId;
      const dataIndex = database.data.findIndex((data: any) => data.id === dataId);
      if (dataIndex === -1) {
        res.status(404).json({ error: 'Data not found' });
      } else {
        database.data.splice(dataIndex, 1);
        await db.collection(collectionName).updateOne({ id: req.params.id }, { $set: { data: database.data } });
        client.close();
        res.status(200).json({ message: 'Data deleted' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
