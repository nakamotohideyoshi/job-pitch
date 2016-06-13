$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	//Populate selects
	$.get("/api/nationalities/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			$('#nationality').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	$.get("/api/sexes/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			$('#sex').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	//Form submit code
	$('#profile').submit(function (event) {
		$('.btn-primary').attr("disabled", true);
		event.preventDefault();

		var first_name = $('#first_name').val();
		var last_name = $('#last_name').val();

		var email = $('#email').val();
		var email_public = $('#email_public').is(':checked');

		var telephone = $('#telephone').val();
		var telephone_public = $('#telephone_public').is(':checked');

		var mobile = $('#mobile').val();
		var mobile_public = $('#mobile_public').is(':checked');

		var age = $('#age').val();
		var age_public = $('#age_public').is(':checked');

		var sex = $('#sex').val();
		var sex_public = $('#sex_public').is(':checked');

		var nationality = $('#nationality').val();
		var nationality_public = $('#nationality_public').is(':checked');

		var description = $('#description').val();
		var cv_upload = $('#cv_upload').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();

		var formData2 = new FormData($('#profile')[0]);

		var active = true;
		formData2.append('active', active);

		$.ajax({
			url: "/api/job-seekers/",
			type: 'POST',
			data: formData2,
			cache: false,
			contentType: false,
			processData: false

		}).done(function (data) {
			window.location.href = "/profile/job-preferences";

		}).fail(function (data) {
			var messageError = '';

			for (var key in data.responseJSON) {
				var obj = data.responseJSON[key];
				if (key == 'non_field_errors') {
					messageError = messageError + obj + '<br>';
				}
				fieldError(obj, key);
			}

			if (messageError != '') {
				formAlert('danger', messageError);
			}

			$('.btn-primary').attr("disabled", false);
		});

	});
	var text_max = 250;

	$('#textarea_feedback').html(text_max + ' characters remaining');

	$('#description').keyup(function () {
		var text_length = $('#description').val().length;
		var text_remaining = text_max - text_length;

		$('#textarea_feedback').html(text_remaining + ' characters remaining');
	});
});