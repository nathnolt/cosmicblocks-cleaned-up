import {
	globals
} from "./globals.js"


const audios = {
	hover: new Audio("sfx/hover.ogg"),
	move: new Audio("sfx/move3.ogg"),
	collision: new Audio("sfx/collision3.ogg"),
	beep: new Audio("sfx/beep.ogg"),
	newgame: new Audio("sfx/newgame.ogg"),
	forfeit: new Audio("sfx/forfeit.ogg"),
	drawgame: new Audio("sfx/drawgame.ogg"),
	youwin: new Audio("sfx/youwin.ogg"),
	gameover: new Audio("sfx/gameover.ogg"),
	drawaccepted: new Audio("sfx/drawaccepted.ogg"),
	connect: new Audio("sfx/connect.ogg"),
	disconnect: new Audio("sfx/disconnected.ogg"),
	opponentdisconnect: new Audio("sfx/opponentdisconnected.ogg"),
	timeout: new Audio("sfx/timeover.ogg"),
	detonate: new Audio("sfx/detonate2.ogg")
}

// To potentially enable global volume bar functionality.
const baseVolume = 1

export function playAudio(name, multiplierVolume=1) {
	console.log('playaudio', name)
	if(!globals.audioEnabled) {
		return
	}
	
	if(audios[name] == undefined) {
		console.error('audio', name, 'not present in audios object')
		return
	}
	
	try {
		const outputVolume = baseVolume * multiplierVolume
		console.log('play audio', name, 'volume', outputVolume)
		
		const audio = getAudio(name)
		audio.volume = outputVolume
		audio.play()
	} catch(err) {
		console.error(err)
	}
	
}

// this is complicated code because when 1 audio is playing, and you try to play it again, 
// it doesn't play it. So this is a way to fix it, by cloning the audioEl, and turning it into an array.
function getAudio(name) {
	let isArray = true
	let audioArr = audios[name]
	if(!Array.isArray(audios[name])) {
		audioArr = [audios[name]]
		isArray = false
	}
	
	for(const audio of audioArr) {
		if(audio.paused) {
			return audio
		}
	}
	
	if(!isArray) {
		audios[name] = audioArr
	}
	
	const playingAudio = audioArr[0]
	const audioClone = playingAudio.cloneNode()
	audioArr.push(audioClone)
	return audioClone
}

window.playAudio = playAudio