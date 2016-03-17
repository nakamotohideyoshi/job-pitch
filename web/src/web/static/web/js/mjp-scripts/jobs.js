function goToJob(id){
        window.location.href = "/single-job/?id="+id;
    }
	
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	//check the user has an active account, required to search jobs.
	$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  
				  job_seeker_id = data.job_seeker;
				  
				  $.get( "/api/job-seekers/"+data.job_seeker, { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
					  var account_active = data.active;
					  if(account_active == false){
							$('#jobListMessages').show();
							$('#accountInactiveJobsPage').show();
						}else{
							$.get( "/api/jobs/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		console.log(data);
			for (var key in data) {
					  var obj = data[key];
					  console.log(obj.location_data);
					  var imageThumb = '';
					  if(obj.images.length != 0){
						  imageThumb = obj.images[0].thumbnail;
					  }
					  if(imageThumb != ''){
					  	$('#list-table tbody').append('<tr data-job-id="'+obj.id+'" class="job-list" id="job-list-'+obj.id+'"><td onclick="goToJob('+obj.id+');"><img width="150px" src="'+imageThumb+'"></td><td onclick="goToJob('+obj.id+');">'+obj.title+'</td><td onclick="goToJob('+obj.id+');" class="jobTableDescription2">'+obj.description+'</td><td onclick="goToJob('+obj.id+');">'+obj.location_data.place_name+'</td></tr>');
					  }else{
						 $('#list-table tbody').append('<tr data-job-id="'+obj.id+'" class="job-list" id="job-list-'+obj.id+'"><td> <img width="150px" src="/static/web/images/no_image_available.png"></td><td onclick="goToJob('+obj.id+');">'+obj.title+'</td><td onclick="goToJob('+obj.id+');" class="jobTableDescription2">'+obj.description+'</td><td onclick="goToJob('+obj.id+');">'+obj.location_data.place_name+'</td></tr>');
					  }
				  }
				  if(data.length==0){
					$('#jobListMessages').show();
					$('#noJobsMatching').show();
				  }else{
				  	$('.main-jobs-list').show();
				  	$('#jobListMessages').hide();
				  }
	})
	.fail(function( data ) {
				$('#profileNon').show();
				
			  });
	
						}
				  });
				  
		});
	
	
	
});