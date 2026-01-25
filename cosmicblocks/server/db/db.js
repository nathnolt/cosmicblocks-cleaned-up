const { getDB } = require('./get-db.js')

let db = getDB()

function createUser(username) {
	const stmt = db.prepare(/*sql */`
	INSERT INTO user (
		
	)`)
	console.log('something like this')
	stmt.exec()
}

function getUserByUsername(username) {
	
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