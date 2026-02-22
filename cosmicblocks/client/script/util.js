export function get_linearBoardArrayPos_from_xyPos(x,y,cols) {
	return (y - 1) * cols + x - 1
}

export function qs(selector, rootNode=document) {
	return rootNode.querySelector(selector)
}