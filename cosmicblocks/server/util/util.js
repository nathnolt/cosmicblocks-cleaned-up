import bcrypt from 'npm:bcryptjs'
import crypto from 'node:crypto'
import path   from 'node:path'
import fs     from 'node:fs'

const __dirname = import.meta.dirname

// Define FS options
const FS_ENCODING_UTF8 = {encoding: 'utf8'}
const FS_PERMS_READ_WRITE_OWNER = {mode: 0o600}

/**
Returns an integer number inclusively between min and max
*/
export function random_inclusive_int(min, max) {
	return parseInt(Math.random() * (max-min+1), 10) + min;
}

export async function passHash(plaintextPassword) {
	const bcryptSaltRounds = 10
	const hashedPassword = await bcrypt.hash(plaintextPassword, bcryptSaltRounds)
	return hashedPassword
}

export async function passVerify(password, hash) {
	const match = await bcrypt.compare(password, hash)
	return match
}


export function getCookieSignerSecret() {
	const folder = path.join(__dirname, '../dynamic/')
	const FILE_PATH = folder + 'cookie-sign-secret.txt'
	
	let secret
	try {
		ensureFolder(folder)
		secret = fs.readFileSync(FILE_PATH, FS_ENCODING_UTF8)
	} catch(err) {
		secret = crypto.randomBytes(64).toString('hex')
		fs.writeFileSync(FILE_PATH, secret, combineObjects(FS_ENCODING_UTF8, FS_PERMS_READ_WRITE_OWNER) )
	}
	
	return secret
}

function combineObjects() {
	return Object.assign({}, ...arguments)
}

export function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj))
}

/**
* create a folder if it does not exsit already
*/
export function ensureFolder(folder) {
	if(!fs.existsSync(folder)) {
		fs.mkdirSync(folder, {recursive: true})
	}
}
