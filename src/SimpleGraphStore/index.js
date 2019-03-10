// SimpleGraphStore
// vue-gun-observable
// Created by Leonard Pauli, Mars 2019
// Copyright © 2019 Leonard Pauli
// MIT-licensed
//

// TODO: use Symbol.for('$ALL'), Symbol.for('$value') instead of string


// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
/* eslint no-bitwise:0 */
// const uuidv4 = ()=> ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
// 	/[018]/g, c=> (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
const uuidv4 = ()=> 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=> {
	const r = Math.random() * 16 | 0
	return (c=='x'? r : r & 0x3 | 0x8).toString(16)
})

/*

Simple normalized graph store

data: {
	root: {
		anna: 'uuid-324g2' // unloaded
		erik: -> 'uuid-jfd32' // loaded
	},
	uuid-324g2: {
		name: -> 'uuid-fri21'
	},
	uuid-fri21: {
		$value: 'Anna'
	}
	...
}

 */

export default class SimpleGraphStore {
	constructor (options) {
		const opt = options || {}
		if (!opt.data) opt.data = {}

		this.data = opt.data
	}


	rootRef () {
		const node = this.data.root
		return node || (this.data.root = {$id: 'root'})
	}
	_nodeFromRef (ref) {
		if (!ref) throw new Error('DemoAdapter: invalid empty ref')
		if (typeof ref === 'object') return ref
		return this.data[ref]
	}
	_hiddenKeys = '$value,$subs,$meta'.split(',')
	keys (ref) { // ref = {x -> ref1, y -> ref2, ...}, get [x, y, ...]
		const node = this._nodeFromRef(ref)
		return node? Object.keys(node)
			.filter(k=> !this._hiddenKeys.includes(k)): []
	}
	_newNode () {
		const id = uuidv4()
		const node = this.data[id] = {$id: id}
		return node
	}
	_nodeFromRefLoaded (ref) {
		const node = this._nodeFromRef(ref)
		if (!node) throw new Error(`DemoAdapter: unloaded ref "${String(ref)}"`)
		return node
	}
	ref (ref, key) { // ref[key] -> x, get x
		const node = this._nodeFromRefLoaded(ref)
		const innerRef = node[key]
		const innerNode = innerRef && this._nodeFromRef(innerRef) || (node[key] = this._newNode())
		return innerNode
	}
	get (ref) { // get primitive val for ref
		const node = this._nodeFromRefLoaded(ref)
		return node.$value
	}


	set (ref, key, val) { // ref[key] = val (if primitive)
		const node = this._nodeFromRefLoaded(ref)
		const innerRef = node[key]
		const innerNode = innerRef && this._nodeFromRef(innerRef) || (node[key] = this._newNode())
		innerNode.$value = val
		this._notify(innerNode, val)
	}
	setRef (ref, key, refVal) { // ref[key] -> refVal (if another ref)
		const node = this._nodeFromRefLoaded(ref)
		// TODO: garbage collect previous node[key]?
		node[key] = refVal
		this._notify(node, key, refVal)
	}


	id (ref) {
		if (!ref) return null
		if (typeof ref === 'object') return ref.$id
		return ref
	}


	// subscription

	_subsAdd (ref, key, cb) {
		// TODO: key validation?
		const node = this._nodeFromRefLoaded(ref)
		const subs = node.$subs || (node.$subs = {})
		const set = subs[key] || (subs[key] = new Set())
		set.add(cb)
		const unsub = ()=> { set.delete(cb) }
		return unsub
	}
	sub (ref, _key, cb) {
		const key = _key===null? '$ALL': _key // '$value', key==null for any
		const unsub = this._subsAdd(ref, key, cb)
		return unsub
	}
	_notify (node, newValue) {
		const subs = node.$subs
		if (!subs) return
		if (subs.$value) subs.$value.forEach(f=> f(node, newValue))
	}
	_notifyRef (node, key, newRef) {
		const subs = node.$subs
		if (!subs) return
		if (subs[key]) subs[key].forEach(f=> f(node, newRef))
		if (subs.$ALL) subs.$ALL.forEach(f=> f(node, newRef))
	}

	tmpMeta (ref) {
		const node = this._nodeFromRefLoaded(ref)
		const meta = node.$meta || (node.$meta = {})
		return meta
	}
}
