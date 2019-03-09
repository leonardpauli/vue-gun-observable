// vue-gun-observable
// Created by Leonard Pauli, Mars 2019
// Copyright © 2019 Leonard Pauli
// MIT-licensed
//

/* global Vue */
/* global Gun */

import dsRootGet, {Node} from './dsRootGet'

const VueGunObservablePlugin = {Node}
VueGunObservablePlugin.install = (Vue, options)=> {
	const opt = options || {}

	// fix options
	if (!opt.adapter) opt.adapter = adapterFromOptions(opt)
	if (!opt.key) opt.key = '$ds'
	if (!opt.rootOverride) opt.rootOverride = _ds=> ({})

	// install on prototype
	const ds = dsRootGet(opt)
	Vue.prototype[opt.key] = ds

}

const adapterFromOptions = opt=> {
	if (opt.adapter) return opt.adapter
	if (!opt.gun) {
		if (typeof Gun === 'undefined')
			throw new Error('Gun not available globally and not provided to options, do Vue.use(VueGunObservable, {gun: new Gun()})')

		opt.gun = new Gun({peers: []})
	}
	if (opt.gun) return throw new Error('TODO') // new GunAdapter({gun: opt.gun})
}


export default VueGunObservablePlugin

// auto install
// if (typeof Vue !== 'undefined' && typeof Gun !== 'undefined') {
//   Vue.use(VueGunObservable)
// }
