// # This is just for putting large blocks of comments. These might be put back into code later. But for right now it's to make the code a bit cleaner.

// ------------------------------------------------------
// 1. Passport stuff for Twitter auth.
// ------------------------------------------------------

// passport is used for logging in with twitter.
// 
// Maybe we'll worry about this later.
// we could always just use username / password authentication, and add more complexity later.
// 
// var passport = require('passport');
// var TwitterStrategy = require('passport-twitter').Strategy;

// it uses sessions. at the moment they are just stored in memory using session-memory-store.
// i may move that to the database later?
// var expressSession = require('express-session');
// var MemoryStore = require('session-memory-store')(expressSession);
// var sessionStore = new MemoryStore();

// i think the secret and the key can just be whatever, as long as they match between the app and io.
// app.use(expressSession({
// 	secret: CREDENTIALS.sessionSecret, 
// 	key: CREDENTIALS.sessionKey, 
// 	store: sessionStore,
// 	resave: false, 
// 	saveUninitialized: false,
// 	cookie: {
// 		secure: false
// 	}
// }));



// app.use(passport.initialize());
// app.use(passport.session());

// var passportSocketIo = require("passport.socketio");






// ------------------------------------------------------
// 2. Stuff with socket.io and passport for twitter auth:
// ------------------------------------------------------

// instead of this:
// io.use(passportSocketIo.authorize({
//   cookieParser: cookieParser, 
//   key: CREDENTIALS.sessionKey, 
//   secret: CREDENTIALS.sessionSecret, 
//   store: sessionStore 
// }));

// passport.use('twitter', new TwitterStrategy({
// 	// this key/secret is from the Twitter App page that has Cosmic Blocks.
// 	consumerKey: CREDENTIALS.twitterConsumerKey,
// 	consumerSecret: CREDENTIALS.twitterConsumerSecret,
// 	callbackURL: "https://cuddle.zone:" + port + "/login/twitter/callback"
// }, 
// function(token, tokenSecret, profile, done) {
// 	process.nextTick(function() { 
// 		// process.nextTick used to wait til the data arrives (??)
// 		if (typeof profile !== 'undefined') {
// 			// the profile may be undefined if you just try to connect to the success url...
// 			userInfo = {
// 				twitterid: profile.id,
// 				username: profile.username,
// 				displayName: profile.displayName,
// 			};
// 			return done(null, userInfo);
// 		}
// 	});
// }));
					
					/*
					
					// add the table to the database
					db.sync(function(err) {
						if (err) throw err;
						var userInfo = undefined;
						var passedColor = getRandomUserColor();
						var tempWins = 0;
						var tempDraws = 0;
						var tempLosses = 0;
						var tempElo = -99999;
						var tempGamesPlayed = 0;
						
						if (typeof User !== 'undefined') {
							User.find({ twitterID: profile.id }, function (err, users){ // this line can fail if try to connect to app before db is connected properly, User undefined.
								if (err) throw err;
								if (users.length === 0) {
									// no user, so we must create it.
									User.create({ 
										displayName: encodeURI(profile.displayName), 
										wins: 0,
										draws: 0,
										losses: 0,
										elo: -99999,
										color: passedColor,
										twitterID: profile.id,
										gamesPlayed: 0,
										twitterHandle: profile.username,
										forfeits: 0,
										//winsByForfeit: 0,
										avgMoveCount: 0,
										connections: 0,
										timePlayed: 0
									}, function(err) {
										if (err) throw err;
									});
									console.log ('@' + profile.username + ' created.');
								} else {
									// found a user, replace temp values w/ db values
									users[0].displayName = encodeURI(profile.displayName);
									users[0].twitterHandle = profile.username;
									passedColor = users[0].color;
									tempWins = users[0].wins;
									tempDraws = users[0].draws;
									tempLosses = users[0].losses;
									tempGamesPlayed = users[0].gamesPlayed;
									tempElo = users[0].elo;
									
									users[0].save(function (err) {
										if (err) throw err;
										console.log ('@' + users[0].twitterHandle + ' connected.');
									});
								}
								
								userInfo = {
									twitterid: profile.id,
									username: profile.username,
									displayName: profile.displayName,
									color: passedColor,
									wins: tempWins,
									draws: tempDraws,
									losses: tempLosses,
									elo: tempElo,
									gamesPlayed: tempGamesPlayed
								};
								*/
							
// passport.serializeUser(function(user, done) {
// 	//place user's id in cookie
// 	done(null, user);
// });
// passport.deserializeUser(function(user, done) {
// 	//retrieve user from db
// 	done(null, user);
// });





