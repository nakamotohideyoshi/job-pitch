$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	//grab location id from url
	var location_id = QueryString.id;
	
	// Add ID to links
	$('.link-create-job').attr('href', '/profile/create-job/?id='+location_id);
	
	//get status data
	
	var open_status;
	var closed_status;
	
	$.get( "/api/job-statuses/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			if(obj.name == "OPEN"){
				open_status = obj;
			}else if(obj.name == "CLOSED"){
				closed_status = obj;
			}
		}
	})
	.fail(function( data ) {
		console.log( data );
	});
	
	// Populate any fields that have data
			  $.get( "/api/user-jobs/", { location:location_id ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  console.log(data);
				  if(data.length != 0){
				  $('#companyName').html(data[0].location_data.business_data.name);
				  $('#locationName').html(data[0].location_data.name);
				  $('#locationName').attr('href', '/profile/list-locations/?id='+data[0].location_data.business_data.id);
					  for (var key in data) {
						  var obj = data[key];
						  var imageThumb = '';
						  var status_text = '';
						  console.log(obj);
						  if(obj.images.length != 0){
							  imageThumb = obj.images[0].thumbnail;
						  }
						  
						  //status
						  if(obj.status == open_status.id){
							  var status_text = 'Job Open'
						  }else if(obj.status == closed_status.id){
							  var status_text = 'Job Closed'
						  }
						  if(imageThumb != ''){
							$('#list-table tbody').append('<tr data-business-id="'+obj.id+'" class="jobs-list" id="jobs-list-'+obj.id+'"><td>'+obj.title+'</td><td class="text-center"><img width="150px" src="'+imageThumb+'"></td><td>'+obj.description+'</td><td>'+status_text+'</td><td><a class="find-staff-btn btn btn-primary" href="/profile/edit-job/?id='+obj.id+'"><i class="fa fa-pencil"></i></a> <a class="delete-action-btn btn btn-primary" href="javascript:deleteRow('+obj.id+',\'user-jobs\' , \'jobs-list-\');"><i class="fa fa-trash-o"></i></a>  <a class="view-applications-btn btn btn-primary" href="/applications/?job='+obj.id+'">View Applicants</a>  <a class="find-staff-btn btn btn-primary" href="/find-staff/?id='+obj.id+'">Find Staff</a></td></tr>');
						  }else{
							 $('#list-table tbody').append('<tr data-business-id="'+obj.id+'" class="jobs-list" id="jobs-list-'+obj.id+'"><td>'+obj.title+'</td><td class="text-center"><img width="150px" src="/static/web/images/no_image_available.png"></td><td>'+obj.description+'</td><td>'+status_text+'</td><td><a class="find-staff-btn btn btn-primary" href="/profile/edit-job/?id='+obj.id+'"><i class="fa fa-pencil"></i></a> <a class="delete-action-btn btn btn-primary" href="javascript:deleteRow('+obj.id+',\'user-jobs\' , \'jobs-list-\');"><i class="fa fa-trash-o"></i></a>  <a class="view-applications-btn btn btn-primary" href="/applications/?job='+obj.id+'">View Applicants</a> <a class="find-staff-btn btn btn-primary" href="/find-staff/?id='+obj.id+'">Find Staff</a></td></tr>');
						  }
					  }
					  $('#table-container').show();
				  }else{
					  $('.glyphicon-chevron-right').hide();
					  $('#no-items-create').show();  
				  }
			  })
			  .fail(function( data ) {
				console.log( data );
			  });
	
	
 	
});