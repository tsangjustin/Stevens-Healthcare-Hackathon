// Node Modules
const MongoClient = require("mongodb").MongoClient;

// Global config
const settings = {
    mongoConfig: {
        serverUrl: "mongodb://localhost:27017/",
        database: "product-forum",
    }
};

// MongoDB Config
let fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
let _connection = undefined;

/**
 * Function checks if there is existing MongoDB Connection
 * If no connection, attempt to connect to Mongo URL and return MongoClient
 * If fail to set up new Mongo connection, throw error back
 * If existing connection, return exsting connection
 *
 * @return  MongoClient connection
 */
let connectDb = () => {
	if (!_connection) {
		_connection = MongoClient.connect(fullMongoUrl).then((db) => {
			return db;
		}).catch((err) => {
			throw "Fail to connect to MongoDB";
		});
	}
	return _connection;
};

module.exports = exports = connectDb;
