$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	var job_seeker_id = 0;
	
	// Populate any fields that have data
			  $.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  
				  job_seeker_id = data.job_seeker;
				  
				  $.get( "/api/job-seekers/"+data.job_seeker, { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
					  
					  console.log( data );
				  if(data.first_name != null){
				  	$('#first_name').val(data.first_name);
				  }
				  if(data.last_name != null){
				  	$('#last_name').val(data.last_name);
				  }
				  if(data.mobile != null){
				  	$('#mobile').val(data.mobile);
				  }
				  if(data.email != null){
				  	$('#email').val(data.email);
				  }
				  if(data.nationality != null){
				  	$('#nationality').val(data.nationality);
				  }
				  if(data.sex != null){
				  	$('#sex').val(data.sex);
				  }
				  if(data.telephone != null){
				  	$('#telephone').val(data.telephone);
				  }
				  if(data.age != null){
				  	$('#age').val(data.age);
				  }
				  if(!data.age_public){
				  	$('#age_public').attr('checked', false);
				  }
				  if(!data.telephone_public){
				  	$('#telephone_public').attr('checked', false);
				  }
				  if(!data.sex_public){
				  	$('#sex_public').attr('checked', false);
				  }
				  if(!data.mobile_public){
				  	$('#mobile_public').attr('checked', false);
				  }
				  if(!data.email_public){
				  	$('#email_public').attr('checked', false);
				  }
				  })
				  .fail(function( data ) {
					console.log( data );
				  });
			  })
			  .fail(function( data ) {
				console.log( data );
			  });
	
	//Form submit code
 	$('#profile').submit(function( event ) {
		event.preventDefault();
		var first_name = $('#first_name').val();
		var last_name = $('#last_name').val();
		var email = $('#email').val();
		var email_public = $('#email_public').val();
		var telephone = $('#telephone').val();
		var telephone_public = $('#telephone_public').val();
		var mobile = $('#mobile').val();
		var mobile_public = $('#mobile_public').val();
		var age = $('#age').val();
		var age_public = $('#age_public').val();
		var sex = $('#sex').val();
		var sex_public = $('#sex_public').val();
		var nationality = $('#nationality').val();
		var nationality_public = $('#nationality_public').val();	
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();
			
			$.put( "/api/job-seekers/"+job_seeker_id+"/", { csrftoken: getCookie('csrftoken'), first_name: first_name, last_name: last_name, email: email, email_public: email_public, telephone: telephone, telephone_public: telephone_public, mobile: mobile, mobile_public: mobile_public,age: age,age_public: age_public,sex: sex,sex_public: sex_public, nationality: nationality, nationality_public: nationality_public }).done(function( data ) {
				formAlert('success', 'Profile Updated!');
				
			  })
			  .fail(function( data ) {
				console.log( data.responseJSON );
			  });
	});
});