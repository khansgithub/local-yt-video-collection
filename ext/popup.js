document.addEventListener("DOMContentLoaded", function(){

	chrome.tabs.query({
		active : true,
		currentWindow : true
	}, function(tabs) {

		url = tabs[0].url;

		chrome.storage.sync.get("urls", function(data){

			list = data["urls"];

			try{

				list.push(url);

			} catch (err) {

				list = [];
				list.push(url);

			}

			list = jQuery.uniqueSort(list);

			chrome.storage.sync.set({"urls" : list});

			for ( u in list ){
				$("#list").append(
					$("<li>").text(list[u])
				);
			}
			
		});

	});

});