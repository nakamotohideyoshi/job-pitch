$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var job_seeker = '';

	$('#search_radius').SumoSelect();

	//Populate selects
	$.get("/api/hours/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			$('#hours').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
		$('#hours').SumoSelect();
	});

	$.get("/api/contracts/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			$('#contract').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
		$('#contract').SumoSelect({placeholder:'Choose a contract'});
	});

	$.get("/api/sectors/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		$('#sectors').html('');

		for (var key in data) {
			var obj = data[key];
			console.log(obj);
			$('#sectors').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}

		$('#sectors').SumoSelect();
	});

	$.get("/api-rest-auth/user/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		job_seeker = data.job_seeker;
		$('#job_seeker').val(data.job_seeker);
	});

	$('#job-preferences').submit(function (event) {
		event.preventDefault();
		clearErrors();

		var sectors = $('#sectors').val();
		var contract = $('#contract').val();
		var hours = $('#job_sector').val();
		var location = $('#location').val();
		var search_radius = $('#search_radius').val();

		if(sectors[0] == ''){
			fieldError('Please, select a sector', 'sectors');
			return false;
		}

		postcodeLocationData(location, function (output) {
			var postcodeData = output.result;
			$('#latitude').val(postcodeData.latitude);
			$('#longitude').val(postcodeData.longitude);
			$('#place_name').val(postcodeData.nuts);
			$('#postcode_lookup').val(location);

			$.ajax({
				url: "/api/job-profiles/",
				type: 'POST',
				data: $('#job-preferences').serialize(),
				cache: false,
				success: function (data) {
					window.location.href = "/profile/pitch";
				}
			});
		});
	});

});