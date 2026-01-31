const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour
const month = 31 * day

module.exports = {
	port: 9001, 
	saveData: true,
	
	// cookie settings
	cookie: {
		
		// this disables front-end javascript from accessing cookies
		httpOnly: true,
		
		// this only sends a cookie over HTTP connections
		secure: true,
		
		// does something as well.
		sameSite: 'Strict',
		
		// age in milliseconds
		maxAge: 1 * month
	},
	
	adminUsernames: [
		'nathan2'
	],
}
