// tests/example
// vue-gun-observable
// Created by Leonard Pauli, mars 2019

import Vue from 'vue'
import Gun from 'gun/gun'
import VueGunObservable from 'vue-gun-observable/src'
import DemoAdapter from 'vue-gun-observable/src/SimpleGraphStore/ObservableAdapter'

import {log} from 'string-from-object'

describe('simple', ()=> {
	it('pre-test', ()=> {
		expect(typeof VueGunObservable.install).toBe('function')
	})

	const data = {}
	Vue.use(VueGunObservable, {
		// gun: new Gun({
		// 	localStorage: false,
		// 	radisk: false,
		// }),
		adapter: new DemoAdapter({data}),
	})

	it('setup', ()=> {
		const vm = new Vue({})
		const {$ds} = vm
		const {Node} = VueGunObservable
		expect($ds instanceof Node).toBeTruthy()
		expect($ds.a instanceof Node).toBeTruthy()
		$ds.b = 3
		expect(Object.keys($ds)).toMatchObject(['a', 'b'])
		expect($ds.b.$value).toBe(3)
		$ds.b.x = 'hello'
		expect($ds.b.$value).toBe(3)
		expect($ds.b.x+'').toBe('hello')

		// setting object value
		$ds.anna.name = 'Anna'
		$ds.erik.name = 'Erik'
		$ds.anna.friend = $ds.erik
		$ds.erik.friend = $ds.anna // cyclic

		expect($ds.erik.friend.name+'').toBe($ds.anna.name+'')
		expect($ds.erik.friend.friend.$ref===$ds.erik.$ref).toBeTruthy()

		// log(data)
	})
})
