// vue-gun-observable
// Created by Leonard Pauli, Mars 2019
// Copyright © 2019 Leonard Pauli
// MIT-lisenced
//

/* global Vue */
/* global Gun */

import dsRootGet from './dsRootGet'

const VueGunObservable = {}
VueGunObservable.install = (Vue, options)=> {
	const opt = options || {}

	// fix gun
	if (!opt.gun) {
		if (typeof Gun === 'undefined')
			throw new Error('Gun not available globally and not provided to options, do Vue.use(VueGunObservable, {gun: new Gun()})')

		opt.gun = new Gun({peers: []})
	}

	// fix other options
	opt.key = opt.key || '$ds'
	opt.rootOverride = opt.rootOverride || (_ds=> ({}))


	// install on prototype
	const ds = dsRootGet(opt)
	Vue.prototype[opt.key] = ds

}

export default VueGunObservable

// auto install
// if (typeof Vue !== 'undefined' && typeof Gun !== 'undefined') {
//   Vue.use(VueGunObservable)
// }
