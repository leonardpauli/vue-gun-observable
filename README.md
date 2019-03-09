# VueGunObservable
*- Plugin for Vue.js allowing seamless integration with the gunjs offline-first, realtime, graph-database as central store + sync, hooking right into vuejs's observable system*


__⚠️ Note:__ work in progress


## Quick Start

```js
// npm i -g @vue/cli
// vue create myapp && cd myapp
// npm i gun vue-gun-observable


// vi src/main.js
...
import Gun from 'gun/gun'
import VueGunObservable from 'vue-gun-observable'

Vue.use(VueGunObservable, {
	gun: new Gun({
		peers: [], // optionally add list of urls for sync, eg. ['https://ex.com/gun', ...]
	}),
	key: '$ds', // how to access it from components
	rootOverride: ds=> ({
		app: ds['myapp_f234'], // makes $ds.app.posts -> $ds.myapp_f234.posts, simplifies namespacing
	}),
})
```

```vue
// vi src/App.vue or any other vue component
<template>
	<div>
		<h1>{{$ds.app.meta.title}}</h1>
		<input v-model="$ds.app.meta.title" @keypress.enter="addTitle"/>
		<ul>
			<li v-for="item in $ds.app.posts.$list()" :key="item.$id">
				{{item.title}}
				<button @click="$ds.app.posts.$remove(item)"> X</button>
			</li>
		</ul>
	</div>
</template>
<script>
export default {
	methods: {
		addTitle () {
			this.$ds.app.posts.$add({
				title: $ds.app.meta.title.$value, // explicitly store the current value (vs. .$ref)
				createdAt: new Date()*1, // gunjs doesn't handle date by default, so convert it to ms using *1 trick
			})
		},
	},
}
</script>
```

Not that much different from just using vue.data? Though with this, you get the features from gundb: persistant storage, and by providing the url to a gunjs peer (eg. via WebRTC for real peer-2-peer, or by setting up a simple server (eg. few clicks with eg. heroku or one line if you have docker ready, see gunjs)): realtime sync, offline first, decentralized, ...



## Limitations

__Possible cons:__ gunjs has not yet (as of Mars 2019) reached version 1.0, and thereby has some gotchas and work left with code quality etc. It's also based on a peer-2-peer protocol which uses encryption for privacy and authentication, which may or may not be sufficient for your project (eg. some might worry that quantum computers or other technological advancements might be able to break the encryption, so even though it might be totally fine now, "private" data now might be readable the later on with no sure way of stopping it). Though you should be able to work around this issue by using an adapter that authorises before sending the data. This will require a trusted server for the "sensitive" data (like all current solutions), though still reap the benefits from the p2p technology in many other cases.

This plugin has special use for field with key '$value' in any node in the original database, see reference below.

Anyhow, this solution makes it very easy and quick to add a persitant + realtime layer to your vuejs application, with little to no developer overhead. Thus, a great solution if you want your project up and running quick in a somewhat trusted environment.


## Reference

```js
// primitive_value is (null, bool, num, or str)

$ds // root node
node // a proxied value with some meta data and helpers


// $value, getter, using valueOf
node.$value // a primitive_value
node.$value === internal_value if primitive, internal_value.$value if object

// node, getter
node !== node.$value
// these will, according to js, invoce the valueOf function, which will return the node.$value
node+'' === node.$value+''
node*1 === node.$value*1


// $value, setter, primitive_value
node.$value = primitive_value
// if internal_value is null or primitive, change it
// if internal_value is object, set internal_value.$value
// setting a previous object-value to primitive is not permitted with the current gunjs p2p implementation, thus the use of .$value
// 	(a possible solution would be to keep track on both object and primitive value separately, to not break the merging when switching between node->str->node)
// (for consistency, primitive values should possibly only be allowed under .$value, though this would lead to memory overhead + incompability with existing gunjs databases with its current implementation)

// $value, setter, object value
node.$value = otherNode
// if value is of type node, set to otherNode.$value
node.$value = gunjsNode or other_object // throw error, only primitive allowed, use node = gunjsNode instead
node.$value = otherNode.$valueRef // not implemented


// node, setter, primitive_value
parent.node = primitive_value

// node, setter, object value
parent.node = otherNode // parent.node -> otherNode
parent.node = gunjsNode // parent.node -> node for gunjsNode
parent.node = other_object // extend parent.node
// if parent.node is primitive_value: parent.node -> new node {$value: primitive_value}, + extend as below
// if parent.node is object_value: extend parent.node with other_object (+ normalized using gunjs)
parent.node = otherNode.$valueRef // not implemented


// id
node.$id // the UUID/gunjs "soul" for the node


// gun
node.$gun // get the gunjs node for the node, eg. node.$gun.put(...)


// list
node.$list() // returns an unordered array (based on gunjs unordered set)
node.$add(node/object) // add to the array/set
node.$remove(node/object) // remove from the array/set
```


## License

Created by Leonard Pauli, Feb/Mars 2019
Copyright © Leonard Pauli, 2019

License: MIT

Contributions welcome (open issue, fork, git clone, branch `<initials>/<issue-number>-<descriptive-word>`, npm i, make changes, npm run lint + npm run test, git commit, git push, make pull-request from your branch in your fork to main repo, summarising changes + ensuring all changes are yours + give full rights to repo owner (to avoid future licensing issues), repo-owner will review and hopefully merge to master + list you as contributor + publish changes)
