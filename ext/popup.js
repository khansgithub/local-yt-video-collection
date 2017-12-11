// Having this as a global variable so ViewFactory can 
// access this to remove entries when the 'remove' button
// is clicked.
//
// Ideally this would be a class level variable in `Contorller`
// but I don't know how to do that.
var model;

// untested
this.import_ = function(i_data){
	// [
	// 		[ID, TITLE],
	// 		[ID, TITLE]
	// ]
	model = new Model([]);
	for ( i = 0; i < i_data.length-1; i++)
		model.add(i_data[0][0], i_data[0][1]);
	chrome.storage.local.set({"model" : model});
}

document.addEventListener("DOMContentLoaded", function(){
	Controller.add();
	$("#export").click(function(event){
		var fml = [];
		for(i = 0; i<model.length-1; i++)
			fml.push([model[i]['id'], model[i]['title']]);
		console.log(fml);
	});
});

// Data structure
function Model(target){

	let _handler = { set : function(target, key, value){
		// Observe when array is being appended to
		target[key] = value;
		// update DOM
		return true;
		}
	}

	// Data structure is a ist with objects, however Proxy
	// converts it into an object when using
	// `chrome.storage.local.set`. So `Model` will convert
	// the object into a list by mapping through each object.
	if (typeof target == "object"){
		id_list = target.id_list;
		delete target["id_list"];
		delete target["add"];
		delete target["remove"];
		target = $.map(target, function(value, index) {
			return [value];
		});
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

// Produces HTML
class ViewFactory{

	static createEntry(id, title){

		let $image = $("<img>", {
			"src" : `https:/\/img.youtube.com/vi/${id}/sddefault.jpg`,
			"class" : "image"
		});
		let $image_td = $("<td>").append($image);

		let $title = $("<a>", {"class" : "title", "href" : `https:\/\/www.youtube.com/watch?v=${id}`}).append(title);
		let $remove = $("<a>", {"class" : "remove"}).append("Remove");
		let $title_td = $("<td>").append($title).append($remove);

		let $row = $("<tr>", {"vid-id" : id}).append($image_td).append($title_td);

		$("tbody").append($row);

		this._remove($remove, id);

	}

	// Takes the jQuery object for the 'remove' button
	// and adds the listener to remove the  appropriate
	// <tr> tag.
	static _remove(row, id){
		//event.target.parentNode
		Controller.remove(row, id);
	}

}

// Controller
class Controller {

	constructor(){
		this.test = "test value - UNCHANGED";
		console.log("this inside constructor");
		console.log(this);
	}

	static add(){
		var title = "";
		var id = "";

		let add_video = function(tabs){
			// Using "id" causes scope problems; `id` in the
			// callback becomes undefined. Hence the variable
			// is named "id_"

			// Controls whether an entry will be pushed. If the
			// the user is not on a YT video page then nothing
			// will be added.
			let add = true;

			let url = tabs[0].url;
			let youtube_regex = /youtube\.com\/watch\?(&)?.*v=/;
			let youtube_id_regex = [
				/v=[^&]+/, // return v=ID&
				/[^v=].+[^&]/ // ID
				]; 

			if (url.match(youtube_regex) == null) {
				add = false;
			} else {
				let temp_ = url.match(youtube_id_regex[0])[0];
				id = temp_.match(youtube_id_regex[1])[0];
				title = tabs[0].title;
			}

			// Check if ADD flag
			// console.log(add);

			chrome.storage.local.get("model", function(data){

				// If storage is empty, `get` returns 'undefined'
				// so instantiate `model` with empty object.

				// If storage is not empty, `get` returns just
				// object with only information. No functions
				// or proxy.

				if (data["model"] == undefined) model = new Model([]);
				else model = new Model(data['model'])

				if ( add ) {
					model.add(id, title);
					chrome.storage.local.set({"model" : model});
				}				

				// update dom
				// the array is in chronological order, so the
				// latest video added is that the bottom but
				// that's a little inconvenient. arranging the array
				// to work in the reversed order is a pain as i just
				// have discovered, so instead videos can just be
				// rendered in the reverse order.
				for (var i = model.length-1; i > -1; i--){
					id = model[i].id;
					title = model[i].title;
					if (title) ViewFactory.createEntry(id, title);
				}

			});
		}

		chrome.tabs.query({active : true,currentWindow : true }, add_video);
	}

	static remove(row, id){
		$(row).click(function(event){
			$(event.target).parent().parent().remove();
			model.remove(id);
			chrome.storage.local.set({"model" : model});
			//console.log(this.test);
			//this.test = "test value - MODIFIED"
			//console.log(this.test);
			console.log("this inside remove");
			console.log(this);
			console.log(id)
		});
	}

}


