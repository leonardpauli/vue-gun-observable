// dsRootGet
// vue-gun-observable
// Created by Leonard Pauli, Mars 2019
// Copyright © 2019 Leonard Pauli
// MIT-licensed
//


class VueGunObservableNode {
	static Symbol = Symbol('VueGunObservableNode')
	static [Symbol.hasInstance] (instance) {
		return instance && instance[Node.Symbol]===true
	}
}
export const Node = VueGunObservableNode



// proxy functions
// (declared outside for reuse)

const getId = (ctx)=> ctx.adapter.id(ctx.ref)

const getPrimitive = (ctx)=> ctx.adapter.get(ctx.ref)
const getString = (ctx, key)=> String(getPrimitive(ctx, key))
const getNested = (ctx, key)=> {
	// console.log(`"${String(key)}" was gotten`)
	const innerRef = ctx.adapter.ref(ctx.ref, key)
	return getProxy(ctx, innerRef)
}

const getValueKeys = (ctx)=> {
	return ctx.adapter.keys(ctx.ref)
}

const nonValueKeys = [
	'$id', '$value', '$ref',
	'toString', 'valueOf', 'constructor',
	Node.Symbol,
	Symbol.toPrimitive, Symbol.toStringTag, Symbol.iterator,
]

// Reflect.ownKeys(target)
const ownKeys = (ctx)=> getValueKeys(ctx).concat(nonValueKeys)

// key in node
const has = (ctx, key)=> ownKeys(ctx).includes(key)


// getter, node[key]
const get = (ctx, key)=> {

	if (typeof key === 'symbol') {
		if (key===Symbol.toPrimitive)
			return (hint)=> {
				if (hint==='string') return getString(ctx)
				// if (hint==='number')
				return getPrimitive(ctx)
			}
		if (key===Symbol.toStringTag)
			return ()=> getString(ctx)
		// TODO
		if (key===Symbol.iterator)
			return function* iter () { yield 1; yield 2 }
		if (key===Node.Symbol)
			return true
		// nodejs inspect (eg. console.dir)
		if (String(key)===`Symbol(util.inspect.custom)`)
			return ()=> `[VueGunObservable ${getId(ctx)}]`
	}
	
	if (typeof key !== 'string') {
		console.warn(`VueGunObservableNode["${String(key)}" (of type ${typeof key})] not handled`)
		return undefined
	}
	
	// return getOwnPropertyDescriptor(ctx, key).get()
	if (key==='$value') return getPrimitive(ctx)
	if (key==='$id') return getId(ctx)
	if (key==='$ref') return ctx.ref

	if (key==='toString') return ()=> getString(ctx)
	if (key==='valueOf') return ()=> getPrimitive(ctx)
	if (key==='constructor') return Node

	return getNested(ctx, key)
}

// setter, primitive, node[key].$value = val
const setPrimitive = (ctx, key, val)=> {
	ctx.adapter.set(ctx.ref, key, val)
}
// setter, node[key] = val
const set = (ctx, key, val)=> {
	// console.log(`"${key}" was set to`, val)

	if (val && typeof val === 'object') {
		if (val instanceof Node) {
			// set by reference
			ctx.adapter.setRef(ctx.ref, key, val.$ref)
			return true
		}
		// else fall through for now
		// TODO: normalize?
	}

	ctx.adapter.set(ctx.ref, key, val)
	return true
}

// unsetter, delete node[key]
const deleteProperty = (ctx, key)=> {
	// console.log(`"${key}" delete / set to null`)
	ctx.adapter.unset(ctx.ref, key)
}

// subfields
const getOwnPropertyDescriptor = (ctx, key)=> {
	if (key==='$value') return {
		get () { return getPrimitive(ctx) },
		set (val) { setPrimitive(ctx, key, val) },
		enumerable: false,
		configurable: true,
	}
	if (key==='$id') return {
		get () { return getId(ctx) },
		enumerable: false,
		configurable: true,
	}
	if (key==='$ref') return {
		get () { return ctx.ref },
		enumerable: false,
		configurable: true,
	}

	if (key==='constructor') return {
		get () { return Node },
		enumerable: false,
		configurable: true,
	}
	if (key==='valueOf') return {
		get () { return ()=> getPrimitive(ctx) },
		enumerable: false,
		configurable: true,
	}
	if (key==='toString') return {
		get () { return ()=> getString(ctx) },
		enumerable: false,
		configurable: true,
	}

	if (!has(ctx, key)) return undefined
	return {
		get () { return getNested(ctx, key) },
		set (val) { set(ctx, key, val) },
		enumerable: true,
		configurable: true,
	}
}

// prevent custom modification
const defineProperty = (ctx, key, desc)=> {
	throw new Error('Defining properties on VueGunObservableNode instance not allowed')
}



// create proxy

const getProxy = (baseCtx, ref)=> {
	const ctx = {...baseCtx, ref}
	const node = new Proxy(ctx, {
		get,
		set,
		deleteProperty,
		ownKeys,
		has,
		getOwnPropertyDescriptor,
		defineProperty,
	})
	ctx.node = node
	return node
}

const dsRootGet = (opt)=> {
	const ctx = {adapter: opt.adapter}
	return getProxy(ctx, ctx.adapter.rootRef())
}

export default dsRootGet
