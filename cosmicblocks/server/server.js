// Cosmic Blocks
// by Narcissa Wright
// code cleanup by nathnolt

// 1. requires
const Fastify = require('fastify')
const fastifySession = require('@fastify/session')
const fastifyCookie = require('@fastify/cookie')
const fastifyFormbody = require('@fastify/formbody')
const FastifyStatic = require('@fastify/static')
const { getCookieSignerSecret } = require('./util.js')


const http = require('http')
const path = require('path')

const { startIO } = require('./game/game.js')
const { convert_client_sass_to_css } = require('./tasks.js')
const { port } = require('./settings.js')
const { eta_render } = require('./templating.js')

const HTML = 'text/html'

// 2. run static tasks
convert_client_sass_to_css()

// 3. server stuff
let server
function serverFactory(handler, opts) {
	server = http.createServer(function(req, res) {
		handler(req, res)
	})
	
	return server
}

const fastify = Fastify({
	logger: true,
	serverFactory: serverFactory
})

fastify.register(fastifyCookie)
fastify.register(fastifySession, {
	secret: getCookieSignerSecret(),
	cookie: {
		secure: 'auto',
	}
})
fastify.register(fastifyFormbody)

// register plugins on fastify
const clientPath = path.join(__dirname, '../client')
fastify.register(FastifyStatic, {
  root: clientPath,
  prefix: '/',
  // prefix: '/public/', // optional: default '/'
  // constraints: { host: 'example.com' } // optional: default {}
})




// start the server
fastify.ready(function() {
	server.listen({port: port})
	console.log("Started server on port " + port)
})



// 4. define the routes
fastify.get('/', handleRootRoute)
fastify.post('/', handleRootRoute)
function handleRootRoute(request, reply) {
	
	if(request.session.user == undefined) {
		setNameFlow(request, reply)
	} else {
		gameFlow(request, reply)
	}
	
	if(request.session.user != undefined) {
		console.log('@TODO: the user is set, so redirect them to the normal page I guess')
	}
}

function setNameFlow(request, reply) {
	const templateContent = {}
	if(request.method === 'POST') {
		const chosenUsername = request?.body?.['chosen-username']
		if( (typeof chosenUsername != 'string') || chosenUsername.length < 1 ) {
			templateContent.error = 'provide a valid value for user name'
		} else {
			
			console.log('@TODO: check if the user exists already')
			
			
		}
	}
	
	
	//const requestBodyKeys = Object.keys(request.body)
	//console.log(requestBodyKeys)
	
	const res = eta_render('set-name', templateContent)
	reply.type(HTML)
	reply.send(res)
}

function gameFlow() {
	console.log('handle the game flow')
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

// alternative login url:
// app.get('/login/twitter', passport.authenticate('twitter'));
// fastify.get('/login/twitter', function(request, reply) {
// 	reply.send('login twitter')
// });

// fastify.get('/login/twitter/callback', function(request, reply) {
// 	reply.send('login twitter callback')
// })

fastify.get('/success', function(request, reply){
	// console.log('__dirname', __dirname)
	// console.log('full path', path.join(__dirname, '/client/'))
	
	reply.sendFile('index.html')
	
	/*
	const clientBase = path.join(__dirname, '../client/')
	try {
		const express_static = express.static(clientBase)
		// console.log(express_static)
		// console.log(app)
		app.use(express_static);
		reply.sendFile(clientBase + 'index.html');
	} catch(err) {
		console.log('error', err)
	}
	*/
});


fastify.get('/failure', function(request, reply){
	// const clientBase = path.join(__dirname, '../client/')
	// const express_static = express.static(clientBase)
	reply.sendFile('failure.html')
});

startIO(server)
