// Handle the HTML templating using eta
import path from 'path'
import { Eta } from 'eta'

const __dirname = import.meta.dirname

const eta = new Eta({
	views: path.join(__dirname, 'templates')
})

export function eta_render(template, vars) {
	const renderVars = Object.assign({}, vars)
	return eta.render(template, renderVars)
}
