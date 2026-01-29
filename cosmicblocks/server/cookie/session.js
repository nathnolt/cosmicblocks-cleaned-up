const crypto = require('crypto')

const {
	getSignedCookie,
	setSignedCookie,
} = require('./signed-cookie.js')

const {
	getCookieSignerSecret
} = require('../util.js')

const session_key = 'sessionId'

function getSetSessionValue(request, response) {
	const cookieSecret = getCookieSignerSecret()
	
	const sessionValue = getSignedCookie(request, cookieSecret, session_key)
	if(sessionValue != null) {
		return sessionValue
	}
	
	const newSessionVal = crypto.randomBytes(32).toString('hex')
	setSignedCookie(response, cookieSecret, session_key, newSessionVal)
	return newSessionVal
}

function getSessionValue(request) {
	const cookieSecret = getCookieSignerSecret()
	
	const sessionValue = getSignedCookie(request, cookieSecret, session_key)
	return sessionValue
}

module.exports = {
	getSetSessionValue,
	getSessionValue
}
