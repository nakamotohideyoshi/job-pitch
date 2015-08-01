$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
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
		
			$.post( "/api/job-seekers/", { first_name: first_name, last_name: last_name, email: email, email_public: email_public, telephone: telephone, telephone_public: telephone_public, mobile: mobile, mobile_public: mobile_public,age: age,age_public: age_public,sex: sex,sex_public: sex_public, nationality: nationality, nationality_public: nationality_public,csrfmiddlewaretoken: csrfmiddlewaretoken }).done(function( data ) {
				
				window.location.href = "/app";
			  })
			  .fail(function( data ) {
				console.log( data.responseJSON );
			  });
	});
});