import crypto from 'crypto'

import {
	getSignedCookie,
	setSignedCookie,
} from './signed-cookie.js'

import {
	getCookieSignerSecret
} from '../util/util.js'

const session_key = 'sessionId'

export function getSetSessionValue(request, response) {
	const cookieSecret = getCookieSignerSecret()
	
	const sessionValue = getSignedCookie(request, cookieSecret, session_key)
	if(sessionValue != null) {
		return sessionValue
	}
	
	const newSessionVal = crypto.randomBytes(32).toString('hex')
	setSignedCookie(response, cookieSecret, session_key, newSessionVal)
	return newSessionVal
}

export function getSessionValue(request) {
	const cookieSecret = getCookieSignerSecret()
	
	const sessionValue = getSignedCookie(request, cookieSecret, session_key)
	return sessionValue
}