function goToLocation(id){
	window.location.href = "/profile/list-locations/?id="+id;
}

$(function() {
	app(context).then(function() {
		$.get( "/api/user-businesses/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {

			getTemplate(CONST.PATH.PARTIALS+'companyRow.html')
			.then(function(companyRowTemplate) {
				var tbodyHtml = '';

				console.log(data);
				for (var key in data) {
					var company = data[key];
					company.imageThumb = CONST.PATH.NOIMAGE;

					if(company.images.length !== 0){
						company.imageThumb = company.images[0].thumbnail;
					}

					tbodyHtml += companyRowTemplate(company);
				}

				$('#list-table tbody').append(tbodyHtml);

				$('a').tooltip();
			});

		});
	});
});
