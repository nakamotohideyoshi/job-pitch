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
		$('.btn-primary').attr( "disabled", true );
		event.preventDefault();
		var first_name = $('#first_name').val();
		var last_name = $('#last_name').val();
		var email = $('#email').val();
		if ($('#email_public').is(':checked')) {
			var email_public = true;
		}else{
			var email_public = false;
		}
		var telephone = $('#telephone').val();
		if ($('#telephone_public').is(':checked')) {
			var telephone_public = true;
		}else{
			var telephone_public = false;
		}
		var mobile = $('#mobile').val();
		if ($('#mobile_public').is(':checked')) {
			var mobile_public = true;
		}else{
			var mobile_public = false;
		}
		var age = $('#age').val();
		if ($('#age_public').is(':checked')) {
			var age_public = true;
		}else{
			var age_public = false;
		}
		var sex = $('#sex').val();
		if ($('#sex_public').is(':checked')) {
			var sex_public = true;
		}else{
			var sex_public = false;
		}
		var nationality = $('#nationality').val();
		if ($('#nationality_public').is(':checked')) {
			var nationality_public = true;
		}else{
			var nationality_public = false;
		}
		var description = $('#description').val();
		var cv_upload = $('#cv_upload').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();
		var formData2 = new FormData($('#profile')[0]);
			$.ajax({
				url: "/api/job-seekers/",
				type: 'POST',
				data: formData2,
				async: false,
				cache: false,
				contentType: false,
				processData: false
			}).done(function( data ) {
				console.log( data );
				window.location.href = "/profile/job-preferences";
			  }).fail(function( data ) {
				var messageError = ''
				for (var key in data.responseJSON) {
					var obj = data.responseJSON[key];
					messageError = messageError+obj+'<br>';
				}
				formAlert('danger', messageError);
			  });
			/*
			
			first_name: first_name, last_name: last_name, email: email, email_public: email_public, telephone: telephone, telephone_public: telephone_public, mobile: mobile, mobile_public: mobile_public,age: age,age_public: age_public,sex: sex,sex_public: sex_public, nationality: nationality, description:description, cv:cv_upload, nationality_public: nationality_public,csrfmiddlewaretoken: csrfmiddlewaretoken
			$.post( "/api/job-seekers/", formData2).done(function( data ) {
				console.log( data );
				//window.location.href = "/profile/job-preferences";
			  })
			  .fail(function( data ) {
				var messageError = ''
				for (var key in data.responseJSON) {
					var obj = data.responseJSON[key];
					messageError = messageError+obj+'<br>';
				}
				formAlert('danger', messageError);
			  });*/
	});
	var text_max = 250;
    $('#textarea_feedback').html(text_max + ' characters remaining');

    $('#description').keyup(function() {
        var text_length = $('#description').val().length;
        var text_remaining = text_max - text_length;

        $('#textarea_feedback').html(text_remaining + ' characters remaining');
    });
});