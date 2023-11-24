const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const util = require("util");
const dbUrl = `mongodb://localhost:27017`;

let client;

async function connectDb() {


  await MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // serverSelectionTimeoutMS: 5000,
    // autoIndex: false, // Don't build indexes
    // maxPoolSize: 10, // Maintain up to 10 socket connections
    // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  })
    .then((result) => {
      client = result;
      console.log("Connected to database");

    //   console.log(`Connection object: ${util.inspect(client, null, null)}`);
    })
    .catch((err) => {
      console.log(
        `Unable to connect to database \n${util.inspect(err, null, null)}`
      );
      throw new Error(err);
    });

  return client;
}

async function getDb() {
  if (client) {
    // console.log(`Connection available`);
    // console.log(`${util.inspect(client, null, null)}`);
    return client;
  }
  console.log(`Connection lost. Trying to setup new connection...`);
  return await connectDb();
}

async function closeDB() {
  if (client) {
    return client.close();
  }
  return;
}

module.exports = {
  getDb,
  connectDb,
  closeDB,
};
