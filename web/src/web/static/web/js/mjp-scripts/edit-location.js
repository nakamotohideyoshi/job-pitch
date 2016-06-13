$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	$('#work_place_details').show();

	//grab location id from url
	var location_id = QueryString.id;

	$('#location').val(location_id);

	$.get("/api/user-locations/" + location_id, {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		if (data.name != null) {
			$('#work_place_name').val(data.name);
		}

		if (data.description != null) {
			$('#work_place_description').val(data.description);
		}

		if (data.address != null) {
			$('#work_place_address').val(data.address);
		}

		if (data.email != null) {
			$('#work_place_email').val(data.email);
		}

		if (data.telephone != null) {
			$('#work_place_telephone').val(data.telephone);
		}

		if (data.mobile != null) {
			$('#work_place_mobile').val(data.mobile);
		}

		if (data.postcode_lookup != null) {
			$('#work_place_location').val(data.postcode_lookup);
		}

		$('#business').val(data.business_data.id);
	});

	//$('#business').val(location_id);
	$('#work_place_details').show();


	$('#work_place_details').submit(function (event) {
		$('.btn-primary').attr("disabled", true);
		event.preventDefault();

		var work_place_name = $('#work_place_name').val();
		var work_place_description = $('#work_place_description').val();
		var work_place_address = $('#work_place_address').val();
		if ($('#work_place_address_public').is(':checked')) {
			var work_place_address_public = true;
		} else {
			var work_place_address_public = false;
		}
		var work_place_email = $('#work_place_email').val();
		if ($('#work_place_email_public').is(':checked')) {
			var work_place_email_public = true;
		} else {
			var work_place_email_public = false;
		}
		var work_place_telephone = $('#work_place_telephone').val();
		if ($('#work_place_telephone_public').is(':checked')) {
			var work_place_telephone_public = true;
		} else {
			var work_place_telephone_public = false;
		}
		var work_place_mobile = $('#work_place_mobile').val();
		if ($('#work_place_mobile_public').is(':checked')) {
			var work_place_mobile_public = true;
		} else {
			var work_place_mobile_public = false;
		}
		var work_place_location = $('#work_place_location').val();
		var location_id = $('#location').val();
		var business_id = $('#business').val();

		postcodeLocationData(work_place_location, function (output) {
			var postcodeData = output.result;

			$.put("/api/user-locations/" + location_id + "/", {
				name: work_place_name,
				description: work_place_description,
				address: work_place_address,
				email: work_place_email,
				email_public: work_place_email_public,
				telephone: work_place_telephone,
				telephone_public: work_place_telephone_public,
				mobile: work_place_mobile,
				mobile_public: work_place_mobile_public,
				business: business_id,
				location: location_id,
				latitude: postcodeData.latitude,
				longitude: postcodeData.longitude,
				postcode_lookup: work_place_location,
				place_name: postcodeData.nuts
			}).done(function (data) {
				formAlert('success', 'Successfully Updated!');

				setTimeout(function () {
					$('.btn-primary').attr("disabled", false);
					$('.alert').hide();
				}, 5000);

			}).fail(function (data) {
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
	});
});