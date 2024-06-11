const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
 try{
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017');
  database = client.db('blog');
 }
 catch(error){
  console.log(error);
 }
}

function getDb() {
  if (!database) {
    throw { message: 'Database connection not established!' };
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb
};