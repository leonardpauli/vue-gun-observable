// subscribing
// vue-gun-observable
// Created by Leonard Pauli, Mars 2019
// Copyright © 2019 Leonard Pauli
// MIT-licensed
//


import {Observer, Dep} from './vue-utils'

export const config = {debug: false}
const debugLog = (...args)=> { if (config.debug) console.log(...args) }


const getDep = (ctx, _key, createIfNeeded = false)=> {
	const key = _key || '$ALL'
	const meta = ctx.adapter.tmpMeta(ctx.ref)
	meta.deps = meta.deps || (meta.deps = {})
	const existing = meta.deps[key]
	const existedBefore = !!existing
	const dep = existedBefore ? existing
		: createIfNeeded ? meta.deps[key] = new Dep()
		: null
	return {existedBefore, dep}
}
const getDepSubsCount = dep=> dep.subs.length
const deleteDep = (ctx, _key)=> {
	const key = _key || '$ALL'
	const meta = ctx.adapter.tmpMeta(ctx.ref)
	if (!meta.deps) return // TODO: unnecessary?
	delete meta.deps[key]
	if (!Object.keys(meta.deps).length)
		delete meta.deps
}

export const subscribe = (ctx, key)=> {

	if (!Dep.target) {
		const {existedBefore, dep} = getDep(ctx, key)
		if (existedBefore) return // dep.remoteValCache

		throw new Error(`Doesn't make sense to get proxied-observale value "${key}" `
			+`when there is no one watching.`
			+`\n\nTip: Put the code in a watcher function or `
			+`add a watcher to the property and dispose it afterwards, eg.:`
			+`\n\tconst teardown = (new Vue()).$watch(()=> obj["${key}"], ()=> {`
			+`\n\t\tconsole.log(obj["${key}"]); teardown() });`)
	}
	
	const {existedBefore, dep} = getDep(ctx, key, true)
	dep.depend()

	if (!existedBefore) {
		debugLog(`🏠: "${key}": Dep created`)

		// proxy Dep.prototype.removeSub
		const _removeSub = dep.removeSub
		dep.removeSub = function removeSub (sub) {
			_removeSub.call(this, sub)

			if (!getDepSubsCount(dep)) {
				dep.unsubRemote()
				deleteDep(ctx, key)
				debugLog(`🏠: "${key}": Dep removed`)
			}
		}

		dep.unsubRemote = ctx.adapter.sub(ctx.ref, key, (_ref, val)=> {
			debugLog(`🏠: update from 🌎 (${key}: ${val})`) // 🌐
			const {dep} = getDep(ctx, key)
			if (!dep) return
			// dep.remoteValCache = val
			dep.notify()
		})
	}
	// return dep.remoteValCache
}
