$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var job_seeker = '';
	var profile_id = '';

	//Populate selects
	$.get("/api/hours/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			$('#hours').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	$.get("/api/contracts/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			$('#contract').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	$.get("/api/sectors/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			$('#sectors').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	$.get("/api-rest-auth/user/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		job_seeker = data.job_seeker;

		$.get("/api/job-seekers/" + job_seeker, {
			csrftoken: getCookie('csrftoken')
		}).done(function (data) {
			profile_id = data.profile;

			if (data.profile == null) {
				window.location.href = "/profile/job-preferences/";
			}

			$.get("/api/job-profiles/" + data.profile, {
				csrftoken: getCookie('csrftoken')
			}).done(function (data) {
				$('#contract').val(data.contract);
				$('#hours').val(data.hours);
				$('#sectors').val(data.sectors);
				$('#location').val(data.postcode_lookup);
				$('#search_radius').val(data.search_radius);
				$('#job_seeker').val(data.job_seeker);
				$('#latitude').val(data.latitude);
				$('#longitude').val(data.longitude);
				$('#place_name').val(data.place_name);
			});
		});
	});


	$('#job-preferences').submit(function (event) {
		$('.btn-primary').attr("disabled", true);
		event.preventDefault();
		var sectors = $('#sectors').val();
		var contract = $('#contract').val();
		var hours = $('#job_sector').val();
		var location = $('#location').val();
		var search_radius = $('#search_radius').val();

		postcodeLocationData(location, function (output) {
			var postcodeData = output.result;

			$('#latitude').val(postcodeData.latitude);
			$('#longitude').val(postcodeData.longitude);
			$('#place_name').val(postcodeData.nuts);
			$('#postcode_lookup').val(location);

			var formData = new FormData($('#job-preferences')[0]);

			$.ajax({
				url: "/api/job-profiles/" + profile_id + "/",
				type: 'PUT',
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				success: function (data) {
					putManyAlerts('#job-preferences', [{
						type: 'success',
						content: 'Successfully Updated!'
					}, {
						type: 'info',
						content: '<i class="fa fa-spinner"></i> Wait a moment. Looking for matching jobs...'
					}]);

					setTimeout(function () {
						window.location.href = "/jobs/";
					}, 5000);

					window.scrollBy(0, -50);
					window.location.hash = '#wrapper';
					//$(window).scrollTop();
				}
			}); //.EndOfAjax
		}); //.EndOf postcodeLocationData
	}); //.EndOf Submit

});