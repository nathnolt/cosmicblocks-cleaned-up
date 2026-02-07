export function get_linearBoardArrayPos_from_xyPos(x,y,cols) {
	return (y - 1) * cols + x - 1
}