function goToJobs(id){
        window.location.href = "/profile/list-jobs/?id="+id;
    }
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	//grab location id from url
	var location_id = QueryString.id;
	
	// Add ID to links
	$('.link-create-job').attr('href', '/profile/create-job/?id='+location_id);
	
	// Populate any fields that have data
			  $.get( "/api/user-jobs/", { location:location_id ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  if(data.length != 0){
					  for (var key in data) {
						  var obj = data[key];
						  var imageThumb = '';
						  console.log(obj);
						  if(obj.images.length != 0){
							  imageThumb = obj.images[0].thumbnail;
						  }
						  if(imageThumb != ''){
							$('#list-table tbody').append('<tr data-business-id="'+obj.id+'" class="jobs-list" id="jobs-list-'+obj.id+'"><td class="text-center" onclick="goToLocation('+obj.id+');"><img width="150px" src="'+imageThumb+'"></td><td onclick="goToLocation('+obj.id+');">'+obj.title+'</td><td onclick="goToLocation('+obj.id+');">'+obj.description+'</td><td><a href="javascript:deleteRow('+obj.id+',\'user-jobs\' , \'jobs-list-\');" class="btn btn-danger btn-delete btn-on-table"><i class="fa fa-trash"></i></a></td></tr>');
						  }else{
							 $('#list-table tbody').append('<tr data-business-id="'+obj.id+'" class="jobs-list" id="jobs-list-'+obj.id+'"><td class="text-center" onclick="goToLocation('+obj.id+');"><img width="150px" src="/static/web/images/no_image_available.png"></td><td onclick="goToLocation('+obj.id+');">'+obj.title+'</td><td onclick="goToLocation('+obj.id+');">'+obj.description+'</td><td><a href="javascript:deleteRow('+obj.id+',\'user-jobs\' , \'jobs-list-\');" class="btn btn-danger btn-delete btn-on-table"><i class="fa fa-trash"></i></a></td></tr>');
						  }
					  }
					  $('#table-container').show();
				  }else{
					  
					  $('#no-items-create').show();  
				  }
			  })
			  .fail(function( data ) {
				console.log( data );
			  });
	
	
 	
});