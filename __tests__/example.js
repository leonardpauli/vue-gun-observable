// tests/example
// vue-gun-observable
// Created by Leonard Pauli, mars 2019

import Vue from 'vue'
import Gun from 'gun/gun'
import VueGunObservable from 'vue-gun-observable/src'

describe('simple', ()=> {
	it('test', ()=> {
		expect(typeof VueGunObservable.install).toBe('function')
	})
})
