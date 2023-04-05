function exportAndImport(){

	function _export(){
		window.export_model = JSON.stringify(window.model);
		console.log("Exported to JSON: window.exported_model");
	}

	window.import_ = function(import_json){
		import_model = new Model(import_json);
		_export();
		console.log("Imported from JSON: window.imported_model");
		console.log("Model updated locally and saved changes to application storage.");
		chrome.storage.local.set({"model" : import_model});
	}
	
	// export button event listener
	$("#export").click(()=>{_export()});

}

function toggleImages(){
	this.img_show = false;

	var toggle = function(){
		this.img_show = !this.img_show;
		entries = $(".entry>td>img");
		for ( i=0; i < entries.length; i++ ){
			entry = entries[i];
			if(this.img_show){
				vid_id = $(entry).parent().parent().attr("vid-id");
				url = `https:/\/img.youtube.com/vi/${vid_id}/default.jpg`;
				$(entry).removeClass("img-off");
				$(entry).addClass("img-on");
				$(entry).attr("src", url);
			} else {
				$(entry).removeAttr("src");
				$(entry).removeClass("img-on");
				$(entry).addClass("img-off");
			}
		}
	}

	$("#toggle_images").click(()=>toggle());
}

var util = {init: ()=>{
	toggleImages();
	exportAndImport();}
};


