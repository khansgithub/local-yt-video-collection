// https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
// https://stackoverflow.com/questions/15005500/loading-cross-domain-endpoint-with-jquery-ajax
// https://gist.github.com/FLamparski/1122e08edeef19ff0913
// https://stackoverflow.com/questions/6857468/converting-a-js-object-to-an-array
/*
	{
		<ID> : { title : "title" },
		<ID> : { title : "title" }
	}

	[
		{ <ID> : { title : <TITLE> } },
		{ <ID> : { title : <TITLE> } }
	]

	[
		{
			id : <ID>,
			title : <TITLE>
		}
	]
*/

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
	// `chrome.storage.sync.set`. So `Model` will convert
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

// Having this as a global variable so ViewFactory can 
// access this to remove entries when the 'remove' button
// is clicked.
var model;

class Controller {
	static add(){
		let add_video = function(tabs){
			// Using "id" causes scope problems; `id` in the
			// callback becomes undefined. Hence the variable
			// is named "id_"

			// Controls whether an entry will be pushed. If the
			// the user is not on a YT video page then nothing
			// will be added.
			let add = true;

			let url = tabs[0].url;
			var youtube_regex = /youtube\.com\/watch\?(&)?.*v=/;
			if (url.match(youtube_regex) == null) add = false;;
			let id_ = url.match(/[^=]*$/)[0];
			let title = tabs[0].title;

			chrome.storage.sync.get("model", function(data){
				let id = id_;

				// If storage is empty, `get` returns 'undefined'
				// so instantiate `model` with empty object.

				// If storage is not empty, `get` returns just
				// object with only information. No functions
				// or proxy.

				if (data["model"] == undefined) model = new Model([]);
				else model = new Model(data['model'])

				if ( add ) {
					model.add(id, title);
					chrome.storage.sync.set({"model" : model});
				}				

				// update dom
				for (var i = 0; i < model.length; i++){
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
			chrome.storage.sync.set({"model" : model});
		});
	}
}

// Controller
document.addEventListener("DOMContentLoaded", function(){
	Controller.add();
});


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

/*
<tr>
	<td style="">
		<img src="https://img.youtube.com/vi/e0gM12u9dmc/sddefault.jpg" style="width: 150px;" class="image">
	</td>

	<td style="width: 300px;">
		<p class="title" style=""> Resuscitated Hope/Lisa Komine [Music Box] (Anime "GOSICK" ED) </p>
	</td>    
</tr>
*/