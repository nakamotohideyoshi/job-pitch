function goToJob(id){
        window.location.href = "/single-job/?id="+id;
    }
	
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
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
					  	$('#list-table tbody').append('<tr data-job-id="'+obj.id+'" class="job-list" id="job-list-'+obj.id+'"><td onclick="goToJob('+obj.id+');"><img width="150px" src="'+imageThumb+'"></td><td onclick="goToJob('+obj.id+');">'+obj.title+'</td><td onclick="goToJob('+obj.id+');">'+obj.description+'</td><td onclick="goToJob('+obj.id+');">'+obj.location_data.place_name+'</td></tr>');
					  }else{
						 $('#list-table tbody').append('<tr data-job-id="'+obj.id+'" class="job-list" id="job-list-'+obj.id+'"><td> onclick="goToJob('+obj.id+');"<img width="150px" src="/static/web/images/no_image_available.png"></td><td onclick="goToJob('+obj.id+');">'+obj.title+'</td><td onclick="goToJob('+obj.id+');">'+obj.description+'</td><td onclick="goToJob('+obj.id+');">'+obj.location_data.place_name+'</td></tr>');
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
	
});