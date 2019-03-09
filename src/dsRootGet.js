// dsRootGet
// vue-gun-observable
// Created by Leonard Pauli, Mars 2019
// Copyright © 2019 Leonard Pauli
// MIT-lisenced
// 


const dsRootGet = (opt)=> {
	return new Proxy({}, {
		get: (_, key)=> {
			console.log(key+' was gotten')
			return 'value_for_'+key
		},
		set: (_, key, val)=> {
			console.log(key+' was set to '+val)
		},
	})
}

export default dsRootGet
