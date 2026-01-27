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

const get_user_by_name_stmt = db.prepare(`SELECT * FROM user WHERE username = :username`)


module.exports = {
	create_user_stmt,
	get_user_by_name_stmt,
}