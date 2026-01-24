const bcrypt = require('bcrypt')

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

module.exports = {
	random_inclusive_int,
	passHash,
	passVerify,
}
