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
		console.log("model updated")
		target[key] = value;
		return true;
		// update DOM
		}
	}

	let r = new Proxy(target, _handler);

	r.add = (id, title) => { target[id] = {"title" : title} };

	return r;
}

document.addEventListener("DOMContentLoaded", function(){
	chrome.tabs.query({active : true,currentWindow : true },

		function(tabs) {

			url = tabs[0].url;
			if (url.match(/youtube/) == null) return;
			id = url.match(/[^=]*$/)[0];
			title = tabs[0].title;

			chrome.storage.sync.get("model", function(data){

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
				for (var key in model){
					console.log(`Key ${key}`);
					console.log(`Title value model[${key}].title`);
				}

		});

	});
});