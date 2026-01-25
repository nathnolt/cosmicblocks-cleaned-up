/* manages everything having to do with the db */
const Database = require('better-sqlite3')
const path = require('path')
const { existsSync } = require('node:fs')
const { createTheDBTables } = require('./create-db')

let db

const DB_path = path.join(__dirname, 'main.db')

// https://www.npmjs.com/package/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md
function getDB() {
	
	if(db != null) {
		return db
	}
	
	let createDB = false
	if(!existsSync(DB_path)) {
		console.log('Could not find DB', DB_path)
		createDB = true
	}
	
	db = new Database(DB_path)
	
	if(createDB) {
		createTheDBTables(db)
	}
	
	return db
}


module.exports = { getDB }
