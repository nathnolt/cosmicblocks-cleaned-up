// Cosmic Blocks
// by Narcissa Wright

// set up
var express = require('express');
const {getDB, getUser} = require('./db.js')
var http = require('http');
var path = require('path');
const { startIO } = require('./game.js')

const { runTasks } = require('./tasks.js')

const {
	random_inclusive_int,
} = require('./util.js')

const { port } = require('./settings.js')

runTasks()

// @TODO, maybe minify client.js to save some bandwidth optionally later.

// let the console know which environment/port this is:
console.log("PORT: " + port)

const db = getDB()
// const User = getUser()


// create the server.
var app = express();
const http_options = {}
var server = http.createServer(http_options, app, function (req, res) {
	res.end();
}).listen(port);

console.log("Started server: localhost:" + port);





// on the landing page just immediately perform a twitter autheticate.
// app.get('/', passport.authenticate('twitter'));
app.get('/', function(req, res) {
	res.send('home')
})

// alternative login url:
// app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/login/twitter', function(req, res) {
	res.send('login twitter')
});

app.get('/login/twitter/callback', function(req, res) {
	res.send('login twitter callback')
})

app.get('/success', function(req, res){
	// console.log('__dirname', __dirname)
	// console.log('full path', path.join(__dirname, '/client/'))
	
	const clientBase = path.join(__dirname, '../client/')
	try {
		const express_static = express.static(clientBase)
		// console.log(express_static)
		// console.log(app)
		app.use(express_static);
		res.sendFile(clientBase + 'index.html');
	} catch(err) {
		console.log('error', err)
	}
	
});


app.get('/failure', function(req, res){
	const clientBase = path.join(__dirname, '../client/')
	const express_static = express.static(clientBase)
	res.sendFile(clientBase + 'failure.html')
});

startIO(server)
