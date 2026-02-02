// const { getDB } = require('./get-db.js')
const { getRandomUserColor } = require('../util/color.js')
const {
	// user
	create_user_stmt,
	get_user_by_name_stmt,
	get_user_by_id_stmt,
	get_leader_data_stmt,
	
	// user update
	update_user_color_stmt,
	update_last_action_stmt,
	
	// session
	link_session_stmt,
	get_userid_from_session_stmt,
} = require('./statements.js')

// let db = getDB()

// console.log('db', db)

function db_createUser(username) {
	
	let stmtResult
	const randomColor = getRandomUserColor()
	const startingElo = 1000
	try {
		stmtResult = create_user_stmt.run({
			username: username,
			color: randomColor,
			elo: startingElo,
		})
		
		const userId = stmtResult.lastInsertRowid
		
		return {value: userId}
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

function db_linkSessionToUserid(sessionValue, userid) {
	try {
		link_session_stmt.run({
			session: sessionValue,
			userid: userid
		})
	} catch(err) {
		console.error(err)
	}
	
}
function db_getUseridFromSession(sessionValue) {
	const row = get_userid_from_session_stmt.get({
		session: sessionValue
	})
	
	if(row != undefined) {
		return row.userid
	}
	return undefined
}

function db_getUserById(userid) {
	return get_user_by_id_stmt.get({
		id: userid
	})
}


function db_getUserByUsername(username) {
	return get_user_by_name_stmt.get({
		username: username
	})
}

function db_getUsersSortedByElo() {
	return get_leader_data_stmt.all()
}

// user update
function db_updateColor(userid, color) {
	try {	
		update_user_color_stmt.run({
			id: userid,
			color: color
		})
	} catch(err) {
		console.error(err)
	}
}

function db_updateLastAction(userid) {
	try {
		update_last_action_stmt.run({id:userid})
	} catch(err) {
		console.error(err)
	}
	
}


// other stuff
function db_validateUser() {
	console.log('@TODO: implement validateUser')
}

function db_updateUserWithGameResults() {
	console.log('@TODO: implement updateUserWithGameResults')
}

module.exports = {
	// user
	db_createUser,
	db_getUserByUsername,
	db_getUserById,
	db_getUsersSortedByElo,
	
	// user update
	db_updateColor,
	db_updateLastAction,
	
	// session
	db_linkSessionToUserid,
	db_getUseridFromSession,
	
	// other stuff
	db_validateUser,
	db_updateUserWithGameResults,
}