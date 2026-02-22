export function b(input) {
	return '<b>' + input + '</b>'
}

export function div(input, classes, style) {
	const classStr = classes ? ' class="' + classes + '"' : ''
	const styleStr = style ? ' style="' + style + '"' : ''
	
	return `<div${classStr}${styleStr}>` + input + '</div>'
}

export function dimMsg(content) {
	return `<span class="dimMsg">${content}</span>`
}

export function redMsg(content, style) {
	let styleStr = style ? ' style="' + style + '"' : ''
	return `<span class="redMsg"${styleStr}>${content}</span>`
}

// export function getElement(htmlStr) {
// 	const div = document.createElement('div')
// 	div.innerHTML = htmlStr.trim()
// 	return div.firstChild
// }

export function emptyEl(el) {
	while(el.lastChild) {
		el.removeChild(el.lastChild)
	}
}