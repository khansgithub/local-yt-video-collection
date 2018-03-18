// Produces HTML
class View{

	static createEntry(id, title){

		let $image = $("<img>", {
			//"src" : `https:/\/img.youtube.com/vi/${id}/sddefault.jpg`,
			"image_url" : `https:/\/img.youtube.com/vi/${id}/sddefault.jpg`,
			"class" : "image",
			"alt" : ""
		});
		$($image).addClass("img-off")
		let $image_td = $("<td>").append($image);

		let $title = $("<a>", {"class" : "title", "href" : `https:\/\/www.youtube.com/watch?v=${id}`}).append(title);
		let $remove = $("<a>", {"class" : "remove"}).append("Remove");
		let $title_td = $("<td>").append($title).append($remove);

		let $row = $("<tr>", {"vid-id" : id}).append($image_td).append($title_td);

		$row.addClass("entry");

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