function goToLocations(id) {
	window.location.href = "/profile/list-jobs/?id=" + id;
}
$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	//grab business id from url
	var business_id = QueryString.id;

	// Looking for tokens
	lookUpForCompany(business_id);

	// Add ID to links
	$('.link-create-location').attr('href', '/profile/create-location/?id=' + business_id);

	// Populate any fields that have data
	$.get("/api/user-locations/", {
		business: business_id,
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		$('#companyName').html(data[0].business_data.name);
		var imageThumb = '';
		var html = '';
		var obj;

		for (var key in data) {
			obj = data[key];
			imageThumb = '/static/web/images/no_image_available.png';

			console.log(obj);

			if (obj.images.length != 0) {
				imageThumb = obj.images[0].thumbnail;
			}

			html += '<tr data-jobs-id="'+obj.id+'" class="locations-list" id="locations-list-'+obj.id+'">'
				+		'<td onclick="goToLocations('+obj.id+');">'+obj.name+'</td>'
				+		'<td class="text-center" onclick="goToLocations('+obj.id+');">'
				+			'<img width="150px" src="'+imageThumb+'">'
				+		'</td>'
				+		'<td onclick="goToLocations('+obj.id+');">'+obj.description+'</td>'
				+		'<td onclick="goToLocations('+obj.id+');">'+obj.jobs.length+'</td>'
				+		'<td>'
				+			'<a class="find-talent-btn btn btn-primary" href="/profile/edit-location/?id='+obj.id+'"><i class="fa fa-pencil"></i></a>'
				+			' <a class="add-job-btn btn btn-primary" href="/profile/post-a-job/?companyid='+obj.business+'&id='+obj.id+'"><i class="fa fa-tasks"></i></a>'
				+			' <a class="delete-action-btn btn btn-primary" href="javascript:deleteRow('+obj.id+',\'user-locations\' , \'jobs-list-\');"><i class="fa fa-trash-o"></i></a>'
				+		'</td>'
				+	'</tr>';
		}

		$('#list-table tbody').append(html);

	}).fail(function (data) {
		console.log(data);
	});

});