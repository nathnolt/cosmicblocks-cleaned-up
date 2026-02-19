const bcrypt = require('bcrypt')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

// Define FS options
const FS_ENCODING_UTF8 = {encoding: 'utf8'}
const FS_PERMS_READ_WRITE_OWNER = {mode: 0o600}

/**
Returns an integer number inclusively between min and max
*/
function random_inclusive_int(min, max) {
	return parseInt(Math.random() * (max-min+1), 10) + min;
}

async function passHash(plaintextPassword) {
	const bcryptSaltRounds = 10
	const hashedPassword = await bcrypt.hash(plaintextPassword, bcryptSaltRounds)
	return hashedPassword
}

async function passVerify(password, hash) {
	const match = await bcrypt.compare(password, hash)
	return match
}


function getCookieSignerSecret() {
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

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj))
}

/**
* create a folder if it does not exsit already
*/
function ensureFolder(folder) {
	if(!fs.existsSync(folder)) {
		fs.mkdirSync(folder, {recursive: true})
	}
}


module.exports = {
	random_inclusive_int,
	passHash,
	passVerify,
	getCookieSignerSecret,
	deepClone,
	ensureFolder,
}

