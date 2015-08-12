$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	//Populate selects
	$.get( "/api/nationalities/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			$('#nationality').append('<option value="'+obj.id+'">'+obj.name+'</options>');
		}
	})
	.fail(function( data ) {
		console.log( data );
		
	});
	
	$.get( "/api/sexes/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			$('#sex').append('<option value="'+obj.id+'">'+obj.name+'</options>');
		}
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
		
			$.post( "/api/job-seekers/", { first_name: first_name, last_name: last_name, email: email, email_public: email_public, telephone: telephone, telephone_public: telephone_public, mobile: mobile, mobile_public: mobile_public,age: age,age_public: age_public,sex: sex,sex_public: sex_public, nationality: nationality, nationality_public: nationality_public,csrfmiddlewaretoken: csrfmiddlewaretoken }).done(function( data ) {
				console.log( data );
				window.location.href = "/profile/job-preferences";
			  })
			  .fail(function( data ) {
				console.log( data.responseJSON );
			  });
	});
});