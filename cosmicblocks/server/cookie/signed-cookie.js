import {
	sign,
	unsign
} from './node-cookie-signature.js'

import {
	setCookie,
	getCookie
} from './cookie.js'

export function setSignedCookie(response, secret, key, value) {
	value = String(value)
	const signedValue = sign(value, secret)
	setCookie(response, key, signedValue)
}

export function getSignedCookie(request, secret, findKey) {
	const signedCookieVal = getCookie(request, findKey)
	if(signedCookieVal == null) {
		return null
	}
	const unsignResult = unsign(signedCookieVal, secret)
	if(unsignResult == false) {
		return null
	}
	return unsignResult
}