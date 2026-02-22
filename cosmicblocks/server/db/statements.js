// 
// prepare all statements and export them, 
// so that all of the SQL statements are cached, 
// so that runtime performance is faster.
// 

import { getDB } from './get-db.js'
let db = getDB()

// Define this as a little string so we can add this
const sla = /*sql*/`, last_action = current_timestamp`

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

const get_leader_data_stmt = db.prepare(
	/*sql*/`SELECT * FROM user ORDER BY elo DESC LIMIT 100`
)


// update functions
const update_user_color_stmt = db.prepare(
	/*sql*/`UPDATE user SET color = :color ${sla} WHERE id = :id`
)
const update_last_action_stmt = db.prepare(
	/*sql*/`UPDATE user SET last_action = current_timestamp WHERE id = :id`
)
const update_user_with_game_results_stmt = db.prepare(
	/*sql*/`
	UPDATE user
	SET
		elo = :elo,
		games_played = :games_played,
		wins = :wins,
		losses = :losses,
		draws = :draws,
		avg_move_count = :avg_move_count,
		last_action = current_timestamp
	WHERE
		id = :id
	`
)



// session stuff
const link_session_stmt = db.prepare(
	/*sql*/`INSERT INTO session (session, userid) VALUES (:session, :userid)`
)
const get_userid_from_session_stmt = db.prepare(
	/*sql*/`SELECT userid FROM session WHERE session = :session`
)

export {
	// user
	create_user_stmt,
	get_user_by_name_stmt,
	get_user_by_id_stmt,
	get_leader_data_stmt,
	
	// user update
	update_user_color_stmt,
	update_last_action_stmt,
	update_user_with_game_results_stmt,
	
	
	// session
	link_session_stmt,
	get_userid_from_session_stmt,
}