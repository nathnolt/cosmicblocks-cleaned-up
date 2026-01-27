function createTheDBTables(db) {
	const {
		user_table,
		user_index1,
		userpassauth_table,
		pragma_wal,
	} = getCreationQueries()
	
	
	db.exec(user_table)
	db.exec(user_index1)
	
	db.exec(userpassauth_table)
	
	// set journal_mode to write ahead logging.
	db.exec(pragma_wal)
}

function getCreationQueries() {
	// 1. table user
	const user_table = /*sql*/`
	CREATE TABLE IF NOT EXISTS user (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT,
		
		wins INTEGER,
		draws INTEGER,
		losses INTEGER,
		elo INTEGER,
		color TEXT,
		games_played INTEGER,
		
		forfeits INTEGER,
		avg_move_count INTEGER,
		connections INTEGER,
		time_played INTEGER,
		last_action TEXT NOT NULL DEFAULT current_timestamp
	)`
	
	const user_index1 = `CREATE INDEX idx__user__username ON user (username)`
	
	// 2. table userpassauth
	const userpassauth_table = /*sql*/`
	CREATE TABLE IF NOT EXISTS userpassauth (
		userid INTEGER PRIMARY KEY,
		password TEXT NOT NULL
	)`
	
	
	// 3. pragma wal
	const pragma_wal = `PRAGMA journal_mode=WAL`
	
	return {
		user_table,
		user_index1,
		userpassauth_table,
		pragma_wal
	}
	
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