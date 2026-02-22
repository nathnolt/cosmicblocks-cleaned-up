import settings from '../settings.js'

const cookieSettings = settings.cookie

export function setCookie(response, key, value) {
	const cookieAttributes = []
	
	// set the value
	cookieAttributes.push(`${key}=${encodeURI(value)}`)
	
	if(cookieSettings.httpOnly) {
		cookieAttributes.push('HttpOnly')
  	}
	
	// set secure
	if (cookieSettings.secure) {
		cookieAttributes.push('Secure');
  	}
	
	if(cookieSettings.sameSite) {
		cookieAttributes.push(`SameSite=${cookieSettings.sameSite}`)
  	}
	
	if(cookieSettings.maxAge) {
    	const expires = new Date(Date.now() + cookieSettings.maxAge)
    	cookieAttributes.push(`Expires=${expires.toUTCString()}`)
	}
	
	const cookieString = cookieAttributes.join('; ')
	
	// Get existing Set-Cookie headers
	let existingCookies = response.getHeader('Set-Cookie') || [];
	if (!Array.isArray(existingCookies)) {
		existingCookies = [existingCookies]
	}
	
	// Add the new cookie string to the array
	existingCookies.push(cookieString)
	
	response.setHeader('Set-Cookie', existingCookies)
}

export function getCookie(request, findKey) {
	const cookieString = request.headers.cookie
	if (!cookieString) {
		return null
	}
	
	const cookiePairs = cookieString.split(';')
	for(const cookie of cookiePairs) {
		const parts = cookie.split('=')
		const key = parts.shift().trim()
		if(key === findKey) {
			return decodeURIComponent(parts.join('='))
		}
	}
	
	return null
}