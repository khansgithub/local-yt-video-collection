// Data structure
function Model(target){

	let _handler = { set : function(target, key, value){
		// Observe when array is being appended to
		target[key] = value;
		return true;
		}
	}

	// Data structure is a ist with objects, however Proxy
	// converts it into an object when using
	// `chrome.storage.local.set`. So `Model` will convert
	// the object into a list by mapping through each object.
	if (typeof target == "object"){
		id_list = [];
		delete target["id_list"];
		delete target["add"];
		delete target["remove"];
		_target = [];
		$.map(target, function(value, index) {
			id_list.push(value.id);
			_target.push(value);
		});
		target = _target;
	}

	//r.add = (id, title) => { target[id] = {"title" : title} };

	let r = new Proxy(target, _handler);

	r.id_list = id_list == undefined ? [] : id_list;

	r.add = function(id, title){
		entry = {
			id : id ,
			"title" : title
		};

		// If there exists an object with the same id,
		// return and do nothing. Prevent duplicates.
		if ( ! ($.inArray(id, this.id_list) == -1) ) return;
		this.id_list.push(id);
		target.push(entry);
	};

	r.remove = function(id){
		let index = $.inArray(id, this.id_list);
		id_list.splice(index, 1);
		model.splice(index, 1);
	}

	return r;

}