// https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
// https://stackoverflow.com/questions/15005500/loading-cross-domain-endpoint-with-jquery-ajax
// https://gist.github.com/FLamparski/1122e08edeef19ff0913
/*
	{
		<ID> : { title : "title" },
		<ID> : { title : "title" }
	}
*/

function Model(target){

	let _handler = { set : function(target, key, value){
		// Observe when array is being appended to
		target[key] = value;
		return true;
		// update DOM
		}
	}

	//r.add = (id, title) => { target[id] = {"title" : title} };

	let r = new Proxy(target, _handler);
	r.add = function(id, title){
		target[id] = { "title" : title };
	}

	return r;
}

var local_model;
var view;

// Controller
document.addEventListener("DOMContentLoaded", function(){

	chrome.tabs.query({active : true,currentWindow : true },

	function(tabs) {

		// Using "id" causes scope problems; `id` in the
		// callback becomes undefined. Hence the variable
		// is named "id_"

		url = tabs[0].url;
		if (url.match(/youtube.com/) == null) return;
		id_ = url.match(/[^=]*$/)[0];
		title = tabs[0].title;

		chrome.storage.sync.get("model", function(data){
			id = id_;

			// If storage is empty, `get` returns 'undefined'
			// so instantiate `model` with empty object.

			// If storage is not empty, `get` returns just
			// object with only information. No functions
			// or proxy.

			if (data["model"] == undefined) model = new Model({});
			else model = new Model(data['model'])

			model.add(id, title);

			chrome.storage.sync.set({"model" : model});
			
			// update dom
			for (var id in model){
				title = model[id].title;
				if (title) {
					console.log("TEST");
					ViewFactory.createEntry(id, title);
				}
			}

		});

	});

});

class ViewFactory{

	static createEntry(id, title, callback){

		let $image = $("<img>", {
			"src" : `https:/\/img.youtube.com/vi/${id}/sddefault.jpg`,
			"class" : "image"
		});
		let $image_td = $("<td>").append($image);

		let $title = $("<p>", {"class" : "title"}).append(title);
		let $title_td = $("<td>").append($title);

		let $row = $("<tr>").append($image_td).append($title_td);

		$("tbody").append($row);

		if(callback){
			callback();
		}

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