const { getDB } = require('./get-db.js')
const { assignColor } = require('../color-util.js')
const {
	create_user_stmt,
	get_user_by_name_stmt,
} = require('./statements.js')

let db = getDB()

// console.log('db', db)

function createUser(username) {
	
	let stmtResult
	const randomColor = assignColor()
	const startingElo = 1000
	try {
		stmtResult = create_user_stmt.run({
			username: username,
			color: randomColor,
			elo: startingElo,
		})
		
		const createdUser = {
			id: stmtResult.lastInsertRowid,
			elo: startingElo,
			username: username,
			color: randomColor,
		}
		
		return {value: createdUser}
	} catch(err) {
		return {error: err}
	}
	
	/*
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
		lastAction TEXT NOT NULL DEFAULT current_timestamp
	 */
}

function getUserByUsername(username) {
	return get_user_by_name_stmt.get({
		username: username
	})
}

function validateUser() {
	
}

function updateUserWithGameResults() {
	
}

module.exports = {
	createUser,
	getUserByUsername,
	validateUser,
	updateUserWithGameResults,
}