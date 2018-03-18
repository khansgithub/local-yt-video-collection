// Controller
class Controller {

	constructor(){
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

				if (data["model"] == undefined) window.model = new Model([]);
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
					if (title) View.createEntry(id, title);
				}

			});
		}

		chrome.tabs.query({active : true,currentWindow : true }, add_video);
	}

	static remove(row, id){
		$(row).click(function(event){
			$(event.target).parent().parent().remove();
			window.model.remove(id);
			chrome.storage.local.set({"model" : window.model});
			//console.log(this.test);
			//this.test = "test value - MODIFIED"
			//console.log(this.test);
			console.log("this inside remove");
			console.log(this);
			console.log(id)
		});
	}

}