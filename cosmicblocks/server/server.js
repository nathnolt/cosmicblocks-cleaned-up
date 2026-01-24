// Cosmic Blocks
// by Narcissa Wright
// code cleanup by nathnolt

// 1. requires
const Fastify = require('fastify')
const FastifyStatic = require('@fastify/static')
const http = require('http')
const path = require('path')

const { startIO } = require('./game.js')
const { convert_client_sass_to_css } = require('./tasks.js')
const { port } = require('./settings.js')
const { eta } = require('./templating.js')
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
fastify.get('/', function(request, reply) {
	const res = eta.render('set-name')
	reply.type(HTML)
	reply.send(res)
	
	// reply.sendFile('login/index.html')
})

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
