const {
	sign,
	unsign
} = require('./node-cookie-signature.js')

const {
	setCookie,
	getCookie
} = require('./cookie.js')

function setSignedCookie(response, secret, key, value) {
	value = String(value)
	const signedValue = sign(value, secret)
	setCookie(response, key, signedValue)
}

function getSignedCookie(request, secret, findKey) {
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

module.exports = {
	getSignedCookie,
	setSignedCookie
}
