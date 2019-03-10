// SimpleGraphStore/ObservableAdapter
// vue-gun-observable
// Created by Leonard Pauli, Mars 2019
// Copyright © 2019 Leonard Pauli
// MIT-licensed
//

import SimpleGraphStore from './'

export default class ObservableAdapter {
	constructor (options) {
		const opt = options || {}
		if (!opt.store) {
			opt.store = new SimpleGraphStore({data: opt.data || {}})
		}

		this.store = opt.store
	}
	
	rootRef () { return this.store.rootRef() }
	keys (ref) { return this.store.keys(ref) }
	ref (ref, key) { return this.store.ref(ref, key) }
	get (ref) { return this.store.get(ref) }
	
	set (ref, key, val) { return this.store.set(ref, key, val) }
	setRef (ref, key, refVal) { return this.store.setRef(ref, key, refVal) }
	unsetRef (ref, key) { return this.store.setRef(ref, key, null) }
	
	id (ref) { return this.store.id(ref) }

	sub (ref, key, cb) { return this.store.sub(ref, key, cb) }

	// in-memory object connected to ref
	tmpMeta (ref) { return this.store.tmpMeta(ref) }
}
