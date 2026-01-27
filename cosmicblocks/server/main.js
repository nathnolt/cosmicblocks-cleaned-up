// Cosmic Blocks
// by Narcissa Wright
// code cleanup by nathnolt

// 1. requires
const { fastify } = require('./create-server.js')

const { convert_client_sass_to_css } = require('./tasks.js')

const { eta_render } = require('./templating.js')
const {
	createUser,
	getUserByUsername,
	validateUser,
	updateUserWithGameResults,
} = require('./db/db.js')

const HTML = 'text/html'

// 2. run static tasks
convert_client_sass_to_css()

// 4. define the routes
fastify.get('/', handleRootRoute)
fastify.post('/', handleRootRoute)
function handleRootRoute(request, reply) {
	console.log('handle root Route', request.session.user)
	
	if(request.session.user == undefined) {
		setNameFlow(request, reply)
	} else {
		renderGameTemplate(reply)
	}
}


function setNameFlow(request, reply) {
	
	let userCreated = false
	const templateContent = {}
	if(request.method === 'POST') {
		const chosenUsername = request?.body?.['chosen-username']
		if( (typeof chosenUsername != 'string') || chosenUsername.length < 1 ) {
			templateContent.error = 'Provide a value for the user name.'
		} else 
		if(chosenUsername.length < 2 || chosenUsername.length > 40) {
			templateContent.error = 'Please choose a username between 2 and 40 characters.'
		} else {
			
			const existingUser = getUserByUsername(chosenUsername)
			if(existingUser != undefined) {
				templateContent.error = 'A user with this name already exists.'
			} else {
				const createdUser = createUser(chosenUsername)
				if(createdUser.error != undefined) {
					templateContent.error = 'Something went wrong creating the user' + createdUser.error
				} else {
					request.session.user = createdUser
					userCreated = true
				}
			}
		}
	}
	
	if(!userCreated) {
		renderSetNameTemplate(reply, templateContent)
	} else {
		renderGameTemplate(reply)
	}
}

function renderSetNameTemplate(reply, templateContent) {
	const res = eta_render('set-name', templateContent)
	reply.type(HTML)
	reply.send(res)
}

function renderGameTemplate(reply) {
	const res = eta_render('game')
	reply.type(HTML)
	reply.send(res)
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