function b(input) {
	return '<b>' + input + '</b>'
}

function div(input, classes, style) {
	const classStr = classes ? ' class="' + classes + '"' : ''
	const styleStr = style ? ' style="' + style + '"' : ''
	
	return `<div${classStr}${styleStr}>` + input + '</div>'
}

function dimMsg(content) {
	return `<span class="dimMsg">${content}</span>`
}
function redMsg(content, style) {
	let styleStr = style ? ' style="' + style + '"' : ''
	return `<span class="redMsg"${styleStr}>${content}</span>`
}

function htmlEntities(str) {
	return (
		String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
	)
}

module.exports = {
	b,
	div,
	dimMsg,
	redMsg,
	htmlEntities,
}
