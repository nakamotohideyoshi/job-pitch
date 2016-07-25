function goToLocation(id){
	window.location.href = "/profile/list-locations/?id="+id;
}

$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	$.get( "/api/user-businesses/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			console.log(data);
			var obj = data[key];
			var imageThumb;
			if(obj.images.length != 0){
				imageThumb = obj.images[0].thumbnail;
			} else {
				imageThumb = "/static/web/images/no_image_available.png";
			}


			var tableBody = '<tr data-business-id="'+obj.id+'" class="business-list" id="business-list-'+obj.id+'">'
			+	'<td onclick="goToLocation('+obj.id+');">'+obj.name+'</td>'
			+	'<td onclick="goToLocation('+obj.id+');"><img width="80px" src="'+imageThumb+'"></td>'
			+	'<td onclick="goToLocation('+obj.id+');">'+obj.locations.length+'</td>'
			+	'<td>'
			+		'<a class="find-staff-btn btn btn-primary" href="/profile/edit-business/?id='+obj.id+'"><i class="fa fa-pencil"></i></a>'
			+		' <a class="add-job-btn btn btn-primary" href="/profile/create-job/?companyid='+obj.id+'"><i class="fa fa-tasks"></i></a>'
			+		' <a href="javascript:deleteRow('+obj.id+',\'user-businesses\' , \'business-list-\');" data-apiFunction="user-businesses" data-rowPrefix="business-list-" data-id="'+obj.id+'" class="delete-action-btn btn btn-primary"><i class="fa fa-trash"></i></a>'
			+	'</td>'
			+'</tr>';

			if(imageThumb === ''){
					tableBody = '<tr class="business-list" id="business-list-'+obj.id+'">'
					+	'<td onclick="goToLocation('+obj.id+');">'+obj.name+'</td>'
					+	'<td onclick="goToLocation('+obj.id+');"><img width="80px" src="/static/web/images/no_image_available.png"></td>'
					+	'<td onclick="goToLocation('+obj.id+');">'+obj.locations.length+'</td>'
					+	'<td>'
					+		'<a class="find-staff-btn btn btn-primary" href="/profile/edit-business/?id='+obj.id+'"><i class="fa fa-pencil"></i></a>'
					+		' <a class="add-job-btn btn btn-primary" href="/profile/create-job/?companyid='+obj.id+'"><i class="fa fa-tasks"></i></a>'
					+		' <a href="javascript:deleteRow('+obj.id+',\'user-businesses\' , \'business-list-\');" data-apiFunction="user-businesses" data-rowPrefix="business-list-" data-id="'+obj.id+'" class="delete-action-btn btn btn-primary"><i class="fa fa-trash"></i></a>'
					+	'</td>'
					+'</tr>';
			}

			$('#list-table tbody').append(tableBody);
		}
	})
	.fail(function( data ) {
	console.log( data );
	});
});