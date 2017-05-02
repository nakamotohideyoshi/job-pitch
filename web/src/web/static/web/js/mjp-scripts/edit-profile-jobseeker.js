$(function() {
	app(context).then(function() {
		getHtmlThumbnailForApitch().then(function(pitchThumbnail) {
			$('#pitchVideoCheck').html(pitchThumbnail);
			$('#pitchVideoCheck img').attr('width', '100%');
		});

		//$("#active_account").bootstrapToggle();
		$('#file-upload').on('change', function() {
			$('#choosen-file').text($('#file-upload').val());
		});

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
				if (data.cv !== '') {
					$('#CVcurrent').attr('href', data.cv).show();
				}
				if (!data.active) {
					$('#active_account').bootstrapSwitch('toggleState');
					$('#account_details_active_only').hide();
					$('#account_details_not_active').show();
				}
				if (data.first_name !== null) {
					$('#first_name').val(data.first_name);
				}
				if (data.last_name !== null) {
					$('#last_name').val(data.last_name);
				}
				if (data.description !== null) {
					$('#description').val(data.description);
				}
				if (data.mobile !== null) {
					$('#mobile').val(data.mobile);
				}
				if (data.email !== null) {
					$('#email').val(data.email);
				}
				if (data.nationality !== null) {
					$('#nationality').val(data.nationality);
				}
				if (data.sex !== null) {
					$('#sex').val(data.sex);
				}
				if (data.telephone !== null) {
					$('#telephone').val(data.telephone);
				}
				if (data.age !== null) {
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
			var email_public = false;
			if ($('#email_public').is(':checked')) {
				email_public = true;
			}

			var telephone = $('#telephone').val();
			var telephone_public = false;
			if ($('#telephone_public').is(':checked')) {
				telephone_public = true;
			}

			var mobile = $('#mobile').val();
			var	mobile_public = false;
			if ($('#mobile_public').is(':checked')) {
				mobile_public = true;
			}

			var age = $('#age').val();
			var age_public = false;
			if ($('#age_public').is(':checked')) {
				age_public = true;
			}

			var sex = $('#sex').val();
			var sex_public = false;
			if ($('#sex_public').is(':checked')) {
				sex_public = true;
			}

			var nationality = $('#nationality').val();
			var nationality_public = false;
			if ($('#nationality_public').is(':checked')) {
				nationality_public = true;
      }

			var active_account = false;
			if ($('#active_account').is(':checked')) {
				active_account = true;
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
				if (data.cv !== '') {
					$('#CVcurrent').show();
					$('#CVcurrent').attr('href', data.cv);
				}

				clearErrors();

				//setTimeout(function () {
				$('.btn-primary').attr("disabled", false);
				$('.alert').hide();
				//}, 5000);

				formAlert('success', 'Profile Updated!');

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
});
