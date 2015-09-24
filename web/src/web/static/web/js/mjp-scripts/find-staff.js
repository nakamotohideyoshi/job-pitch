
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	//grab location id from url
	var job_id = QueryString.id;
	
	$.get( "/api/job-seekers/?job="+job_id, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		console.log(data);
		for (var key in data) {
					  var obj = data[key];
					  console.log(obj);
					  var imageThumb = '';
					  if(obj.pitches.length != 0){
						  if(obj.pitches[0].thumbnail != null){
						  	imageThumb = obj.pitches[0].thumbnail;
						  }
					  }
					  if(imageThumb != ''){
					  	$('#list-table tbody').append('<tr data-job-seeker-id="'+obj.id+'" class="job-seeker-list" id="job-seeker-list-'+obj.id+'"><td onclick="viewPitch(\''+obj.pitches[0].video+'\','+job_id+','+obj.id+');"><img width="150px" src="'+imageThumb+'"></td><td onclick="viewPitch(\''+obj.pitches[0].video+'\');">'+obj.first_name+' '+obj.last_name+'</td></tr>');
					  }else{
						$('#list-table tbody').append('<tr data-job-id="'+obj.id+'" class="job-list" id="job-list-'+obj.id+'"><td onclick="viewPitch(\''+obj.pitches[0].video+'\','+job_id+','+obj.id+');"><img width="150px" src="/static/web/images/no_image_available.png"></td><td onclick="viewPitch(\''+obj.pitches[0].video+'\');">'+obj.first_name+' '+obj.last_name+'</td></tr>');
					  }
				  }
				  if(data.length==0){
					$('#noJobsMatching').show();
					$('.main-job-seeker-list').hide();
				  }else{
				  	$('.main-job-seeker-list').show();
				  	$('#noJobsMatching').hide();
				  }
	})
	.fail(function( data ) {
				$('#profileNon').show();
	});
});