$(document).ready(function() {
	$.get( "/api/pitches/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		//console.log(data[0].video);
		$('.viewYourPitch').html('<video width="320" height="240" controls><source src="'+data[0].video+'" type="video/mp4"></video>');
	});
});
