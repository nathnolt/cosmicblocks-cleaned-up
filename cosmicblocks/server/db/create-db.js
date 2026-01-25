function createTheDBTables(db) {
	const userQueries = userQueries()
	db.exec(userQueries.table)
	db.exec(userQueries.index1)
	
	const authQueries = userAuthQueries()
	db.exec(authQueries.table)
}

function userQueries() {
	const table = /*sql*/`
	CREATE TABLE IF NOT EXISTS user (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT,
		
		wins INTEGER,
		draws INTEGER,
		losses INTEGER,
		elo INTEGER,
		color TEXT,
		gamesPlayed INTEGER,
		
		forfeits INTEGER,
		avgMoveCount INTEGER,
		connections INTEGER,
		timePlayed INTEGER,
		last_action TEXT NOT NULL DEFAULT current_timestamp
	)`
	
	const index1 = `CREATE INDEX idx__user__username ON user (username)`
	
	return {table, index1}
}

function userAuthQueries() {
	const table = /*sql*/`
	CREATE TABLE IF NOT EXISTS userpassauth (
		userid INTEGER PRIMARY KEY,
		password TEXT NOT NULL
	)`
	
	return {table}
}

module.exports = {
	createTheDBTables
}


/*
var db = orm.connect(CREDENTIALS.database, function (err, _db) {
	if (err) {
		return callback(err);
	}
	User = _db.define("users", {
		id            : Number,
		displayName   : String,
		wins          : Number,
		draws         : Number,
		losses        : Number,
		elo           : Number,
		color         : String,
		twitterID     : String,
		gamesPlayed   : Number,
		twitterHandle : String,
		forfeits      : Number,
		//winsByForfeit : Number,
		avgMoveCount  : Number,
		connections   : Number,
		timePlayed    : Number
	});
	console.log("Connected to DB.");
	return callback(null, User, db);
});
*/