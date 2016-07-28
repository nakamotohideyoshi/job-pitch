function goToLocation(id){
	window.location.href = "/profile/list-locations/?id="+id;
}

$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	$.get( "/api/user-businesses/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {

		getTemplate(CONST.PATH.PARTIALS+'companyRow.html')
		.then(function(companyRowTemplate) {
			var tbodyHtml = '';

			console.log(data);
			for (var key in data) {
				var company = data[key];
				company.imageThumb = '/static/web/images/no_image_available.png';

				if(company.images.length != 0){
					company.imageThumb = company.images[0].thumbnail;
				}

				tbodyHtml += companyRowTemplate(company);
			}

			$('#list-table tbody').append(tbodyHtml);

			$('a').tooltip();
		});

	})
	.fail(function( data ) {
	console.log( data );
	});
});