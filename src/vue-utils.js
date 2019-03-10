import Vue from 'vue'


// get classes
const {Observer, Dep} = (()=> {
	const raw = {}
	const obs = Vue.observable(raw)
	const ob = obs.__ob__
	if (!ob.constructor) throw new Error('Has Vue changed?')
	const Observer = ob.constructor
	const Dep = ob.dep.constructor
	// Dep.target
	return {Observer, Dep}
})()

export {Observer, Dep}
