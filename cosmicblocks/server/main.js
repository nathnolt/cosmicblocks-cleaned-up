///////////////////////////////////////////
// Cosmic Blocks - Narcissa Wright
// Cleanup by nathnolt
///////////////////////////////////////////

// const { convert_client_sass_to_css } = require('./tasks.js')
// // 2. run static tasks
// convert_client_sass_to_css()

const path = require('path')
const { serveStatic } = require('@hono/node-server/serve-static')
const { app } = require('./create-server.js')

const {
	getSetSessionValue,
} = require('./cookie/session.js')

app.use('/*', serveStatic({ root: path.join(__dirname + '/../client/') }))

const { eta_render } = require('./templating.js')
const {
	db_createUser,
	db_getUserByUsername,
	
	// session
	db_linkSessionToUserid,
	db_getUseridFromSession,
	
	validateUser,
	updateUserWithGameResults,
} = require('./db/db.js')





// 4. define the routes
app.get('/', handleRootRoute)
app.post('/', handleRootRoute)
function handleRootRoute(c) {
	const {request, reply} = getRequestReply(c)
	const sessionValue = getSetSessionValue(request, reply)
	
	const userId = db_getUseridFromSession(sessionValue)
	console.log('userId', userId)
	
	if(userId == undefined) {
		return setNameFlow(c, sessionValue)
	} else {
		return renderGameTemplate(c)
	}
}


async function setNameFlow(c, sessionValue) {
	const requestMethod = c.req.method
	const requestBody = await c.req.parseBody()
	
	let userCreated = false
	const templateContent = {}
	
	
	// 1. Handle user creation
	if(requestMethod === 'POST') {
		const chosenUsername = requestBody?.['username']
		if( (typeof chosenUsername != 'string') || chosenUsername.length < 1 ) {
			templateContent.error = 'Provide a value for the user name.'
		} else 
		if(chosenUsername.length < 2 || chosenUsername.length > 40) {
			templateContent.error = 'Please choose a username between 2 and 40 characters.'
		} else {
			const existingUser = db_getUserByUsername(chosenUsername)
			if(existingUser != undefined) {
				templateContent.error = 'A user with this name already exists.'
			} else {
				
				const createdUser = db_createUser(chosenUsername)
				if(createdUser.error != undefined) {
					templateContent.error = 'Something went wrong creating the user' + createdUser.error
				} else {
					const userId = createdUser.value
					db_linkSessionToUserid(sessionValue, userId)
					userCreated = true
				}
			}
		}
	}
	
	// 2. Render the template
	if(!userCreated) {
		return renderSetNameTemplate(c, templateContent)
	} else {
		return renderGameTemplate(c)
	}
}




function renderSetNameTemplate(c, templateContent) {
	const renderedTemplate = eta_render('set-name', templateContent)
	return c.html(renderedTemplate)
}

function renderGameTemplate(c) {
	// console.log(fastifyMemoryStore.all())
	const renderedTemplate = eta_render('game')
	return c.html(renderedTemplate)
}

function debugRequest(request) {
	// console.log('-----')
	// console.log('request_id', request.id)
	// console.log('-----')
	// console.log('request_params', request.params)
	// console.log('-----')
	// console.log('request_query', request.query)
	// console.log('-----')
	// console.log('request_body', request.body)
	// console.log('-----')
	
	// const keys = Object.keys(request)
	// console.log('req keys', keys)
}


function getRequestReply(c) {
	return {
		request: c.env.incoming, // request
		reply: c.env.outgoing // reply / response
	}
}