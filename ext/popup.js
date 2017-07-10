// https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
// https://stackoverflow.com/questions/15005500/loading-cross-domain-endpoint-with-jquery-ajax
// https://gist.github.com/FLamparski/1122e08edeef19ff0913
/*
	{
		<ID> : { title : "title" },
		<ID> : { title : "title" }
	}
*/

_model = {};
_handler = {
	set : function(target, key, value){
		// Observe when array is being appended to
		target[key] = value;
		console.log(`Key ${key} to Value ${value}`)
		return true;
		// update DOM
	}
}

function Model(target, handler){
	target.add = (id, title) => { target[id] = {"title" : title} };
	return new Proxy(target, handler);
}

model = new Model(_model, _handler);

// model = new function(){
// 	let r = new Proxy(target, handler);
// 	r.add = id =>{ model[id] = {"title" : title} };
// 	return r;
// }

document.addEventListener("DOMContentLoaded", function(){
	chrome.tabs.query({active : true,currentWindow : true },

		function(tabs) {

			url = tabs[0].url;
			if (url.match(/youtube/) == null) return;
			id = url.match(/[^=]*$/)[0];
			title = tabs[0].title;

			chrome.storage.sync.get("model", function(data){

				// If this is the first time saving to storage
				// then `data["model"]` will return an empty
				// object. In this case `model` will still
				// refer to the data strcuture previously
				// defined.
				//
				// This is a really weird pattern huh ._.
				console.log(data.model);

				//                                                vvvvvvvvvvvvvvvvvvvvvvvvv
				// Is not recieving the right type of objects
				// to create a Model object with.
				// TO FIX
				if (!jQuery.isEmptyObject(data["model"])) model = new Model(data["model"]);

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