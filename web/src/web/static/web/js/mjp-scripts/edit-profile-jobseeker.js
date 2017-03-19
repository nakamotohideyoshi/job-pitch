$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	getHtmlThumbnailForApitch().then(function(pitchThumbnail) {
		$('#pitchVideoCheck').html(pitchThumbnail);
		$('#pitchVideoCheck img').attr('width', '100%');
	});

	//$("#active_account").bootstrapToggle();

	//$('#active_account').on('switchChange.bootstrapSwitch', function (event, state) {
	$('#active_account').change(function() {
		if ($(this).prop('checked')) {
			$('#account_details_not_active').hide();
			$('#account_details_active_only').show();
		} else {
			$('#account_details_not_active').show();
			$('#account_details_active_only').hide();

		}
	});

	//Populate selects
	$.get("/api/nationalities/", {
		csrftoken: getCookie('csrftoken')
	}).done(function(data) {
		for (var key in data) {
			var obj = data[key];
			$('#nationality').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	$.get("/api/sexes/", {
		csrftoken: getCookie('csrftoken')
	}).done(function(data) {
		for (var key in data) {
			var obj = data[key];
			$('#sex').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	var job_seeker_id = 0;

	// Populate any fields that have data
	$.get("/api-rest-auth/user/", {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	}).done(function(data) {

		job_seeker_id = data.job_seeker;

		$.get("/api/job-seekers/" + data.job_seeker, {
			token: getCookie('key'),
			csrftoken: getCookie('csrftoken')
		}).done(function(data) {

			if (data.cv != '') {
				$('#CVcurrent').attr('href', data.cv);
			} else {
				$('#CVcurrent').hide();
			}
			if (!data.active) {
				$('#active_account').bootstrapSwitch('toggleState');
				$('#account_details_active_only').hide();
				$('#account_details_not_active').show();
			}
			if (data.first_name != null) {
				$('#first_name').val(data.first_name);
			}
			if (data.last_name != null) {
				$('#last_name').val(data.last_name);
			}
			if (data.description != null) {
				$('#description').val(data.description);
			}
			if (data.mobile != null) {
				$('#mobile').val(data.mobile);
			}
			if (data.email != null) {
				$('#email').val(data.email);
			}
			if (data.nationality != null) {
				$('#nationality').val(data.nationality);
			}
			if (data.sex != null) {
				$('#sex').val(data.sex);
			}
			if (data.telephone != null) {
				$('#telephone').val(data.telephone);
			}
			if (data.age != null) {
				$('#age').val(data.age);
			}
			if (!data.age_public) {
				$('#age_public').attr('checked', false);
			}
			if (!data.telephone_public) {
				$('#telephone_public').attr('checked', false);
			}
			if (!data.sex_public) {
				$('#sex_public').attr('checked', false);
			}
			if (!data.mobile_public) {
				$('#mobile_public').attr('checked', false);
			}
			if (!data.email_public) {
				$('#email_public').attr('checked', false);
			}

		});
	});

	//Form submit code
	$('#profile').submit(function(event) {
		formAlert('info', 'Updating profile...');

		$('.btn-primary').attr("disabled", true);
		event.preventDefault();
		var first_name = $('#first_name').val();
		var last_name = $('#last_name').val();
		var email = $('#email').val();
		if ($('#email_public').is(':checked')) {
			var email_public = true;
		} else {
			var email_public = false;
		}
		var telephone = $('#telephone').val();
		if ($('#telephone_public').is(':checked')) {
			var telephone_public = true;
		} else {
			var telephone_public = false;
		}
		var mobile = $('#mobile').val();
		if ($('#mobile_public').is(':checked')) {
			var mobile_public = true;
		} else {
			var mobile_public = false;
		}
		var age = $('#age').val();
		if ($('#age_public').is(':checked')) {
			var age_public = true;
		} else {
			var age_public = false;
		}
		var sex = $('#sex').val();
		if ($('#sex_public').is(':checked')) {
			var sex_public = true;
		} else {
			var sex_public = false;
		}
		var nationality = $('#nationality').val();
		if ($('#nationality_public').is(':checked')) {
			var nationality_public = true;
		} else {
			var nationality_public = false;
		}
		if ($('#active_account').is(':checked')) {
			var active_account = true;
		} else {
			var active_account = false;
		}
		var description = $('#description').val();
		var cv_upload = $('#cv_upload').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();
		var formData2 = new FormData($('#profile')[0]);
		formData2.append('active', active_account);
		$.ajax({
			url: "/api/job-seekers/" + job_seeker_id + "/",
			type: 'PUT',
			data: formData2,
			cache: false,
			contentType: false,
			processData: false
		}).done(function(data) {
			if (data.cv != '') {
				$('#CVcurrent').show();
				$('#CVcurrent').attr('href', data.cv);
			}

			clearErrors();

			//setTimeout(function () {
			$('.btn-primary').attr("disabled", false);
			$('.alert').hide();
			//}, 5000);

			formAlert('success', 'Profile Updated!');

		}).fail(function(data) {
			var messageError = ''
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

	$('#description').keyup(function() {
		var text_length = $('#description').val().length;
		var text_remaining = text_max - text_length;

		$('#textarea_feedback').html(text_remaining + ' characters remaining');
	});
});