// 
// prepare all statements and export them, 
// so that all of the SQL statements are cached, 
// so that runtime performance is faster.
// 

const { getDB } = require('./get-db.js')
let db = getDB()

const create_user_stmt = db.prepare(/*sql */`
INSERT INTO user (
	username,
	wins,
	draws,
	losses,
	elo,
	color,
	games_played,
	
	forfeits,
	avg_move_count,
	connections,
	time_played
) VALUES (
	:username,
	0, -- wins
	0, -- draws
	0, -- losses
	:elo, -- elo
	:color, -- color
	0, -- games_played
	
	0, --forfeits
	0, -- avg_move_count
	0, -- connections
	0 -- time_played
)`)

const get_user_by_name_stmt = db.prepare(
	/*sql*/`SELECT * FROM user WHERE username = :username`
)

const get_user_by_id_stmt = db.prepare(
	/*sql*/`SELECT * FROM user WHERE id = :id`
)


// update functions
const update_user_color_stmt = db.prepare(
	/*sql*/`UPDATE user SET color = :color WHERE id = :id`
)


// session stuff
const link_session_stmt = db.prepare(
	/*sql*/`INSERT INTO session (session, userid) VALUES (:session, :userid)`
)
const get_userid_from_session_stmt = db.prepare(
	/*sql*/`SELECT userid FROM session WHERE session = :session`
)

module.exports = {
	// User
	create_user_stmt,
	get_user_by_name_stmt,
	get_user_by_id_stmt,
	update_user_color_stmt,
	
	// Session
	link_session_stmt,
	get_userid_from_session_stmt,
}