/* manages everything having to do with the db */
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { createTheDBTables } from './create-db.js'
import { ensureFolder } from './../util/util.js'

const __dirname = import.meta.dirname

let db

const DB_folder = path.join(__dirname, '../dynamic/')
const DB_path = DB_folder + 'main.db'

// https://www.npmjs.com/package/better-sqlite3
// https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md
export function getDB() {
	
	if(db != null) {
		return db
	}
	
	let createDB = false
	if(!existsSync(DB_path)) {
		console.log('Could not find DB', DB_path)
		ensureFolder(DB_folder)
		createDB = true
	}
	
	
	db = new DatabaseSync(DB_path)
	
	if(createDB) {
		createTheDBTables(db)
	}
	
	return db
}
