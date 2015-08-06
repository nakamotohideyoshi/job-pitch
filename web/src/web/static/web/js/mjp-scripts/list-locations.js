function goToJobs(id){
        window.location.href = "/profile/list-jobs/?id="+id;
    }
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	//grab business id from url
	var business_id = QueryString.id;
	
	// Populate any fields that have data
			  $.get( "/api/user-locations/", { business:business_id ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  
				  for (var key in data) {
					  var obj = data[key];
					  var imageThumb = '';
					  console.log(obj);
					  if(obj.images.length != 0){
						  imageThumb = obj.images[0].thumbnail;
					  }
					  if(imageThumb != ''){
					  	$('#list-table tbody').append('<tr onclick="goToJobs('+obj.id+');" data-jobs-id="'+obj.id+'" class="business-list" id="jobs-list-'+obj.id+'"><td class="text-center"><img width="150px" src="'+imageThumb+'"></td><td>'+obj.name+'</td><td>'+obj.description+'</td><td>'+obj.jobs.length+'</td></tr>');
					  }else{
						 $('#list-table tbody').append('<tr onclick="goToJobs('+obj.id+');" data-jobs-id="'+obj.id+'" class="business-list" id="jobs-list-'+obj.id+'"><td class="text-center"><img width="150px" src="/static/web/images/no_image_available.png"></td><td>'+obj.description+'</td><td>'+obj.description+'</td><td>'+obj.jobs.length+'</td></tr>');
					  }
				  }
			  })
			  .fail(function( data ) {
				console.log( data );
			  });
	
	
 	
});