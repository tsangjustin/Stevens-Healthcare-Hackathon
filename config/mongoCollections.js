// Custom Node Modules
const dbConnection = require("./mongoConnection");

/**
 * Function is given string of collection name to connect to
 * Check that collection is valid string; then grab MongoClient to grab collection
 * If there is error, collection may not exist, so attempt to create the collection
 * Then, return successful Promise with collection object
 *
 * @params  collection  String value of collection name to perform DB actions on
 * @return  Promise if successful return Mongo collection object; otherwise, if
 *			invalid collection or fail to connect collection, reject Promise
 */
let getCollection = (collection) => {
	// Check for valid collection name
	if ((collection === undefined) || (typeof(collection) !== 'string') || (collection.length <= 0)) {
		return Promise.reject('Invalid collection name');
	}
	let _col = undefined;
	return () => {
		return new Promise((success, reject) => {
			if (_col !== undefined) {
				return success(_col);
			}
			dbConnection().then((db) => {
				try {
					_col = db.collection(collection);
					return success(_col);
				} catch (e) {
					db.createCollection(collection, (err, newCollection) => {
						if (err) {
							return reject("Fail to connect to database collection");
						}
						_col = newCollection;
						return success(_col);
					});
				}
			}).catch((err) => {
				return reject(err);
			});
		});
	};
};

module.exports = exports = {
	"users": getCollection("users"),
	"forums": getCollection("forums")
};
