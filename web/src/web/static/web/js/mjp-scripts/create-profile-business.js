$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var imageCurrentLogo = '';
	var formData = '';
	//Form submit code
	$('#company_details').submit(function (event) {
		event.preventDefault();

		var company_name = $('#company_name').val();
		$.post("/api/user-businesses/", {
			name: company_name
		}).done(function (data) {
			$('#business').val(data.id);

			formData = new FormData($('#company_details')[0]);
			$.ajax({
				url: '/api/user-business-images/',
				type: 'POST',
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				success: function (data) {
					$('#currentLogo').attr('src', data.thumbnail).show();
					$.get(data.image, function (data2) {
						imageCurrentLogo = data2;
					});

					$('#company_details').fadeOut(250, function () {
						$('#work_place_details').fadeIn(250);
						$('.page-header').html('Create your first recruitment location');
					});
				}
			});

		});
	});

	$('#work_place_details').submit(function (event) {
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
		var business_id = $('#business').val();

		postcodeLocationData(work_place_location, function (output) {
			var postcodeData = output.result;

			$.post("/api/user-locations/", {
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
				latitude: postcodeData.latitude,
				longitude: postcodeData.longitude,
				place_name: postcodeData.nuts,
				postcode_lookup: work_place_location
			}).done(function (data) {
				$('#location').val(data.id);
				var location_id = data.id;
				if ($('#work_place_image').val() != '') {
					var formData2 = new FormData($('#work_place_details')[0]);
					$.ajax({
						url: '/api/user-location-images/',
						type: 'POST',
						data: formData2,
						cache: false,
						contentType: false,
						processData: false,
						success: function (data) {
							console.log(data);
							window.location.href = "/profile/list-businesses/";
						},
						fail: function (data) {
							var messageError = ''
							for (var key in data.responseJSON) {
								var obj = data.responseJSON[key];
								messageError = messageError + obj + '<br>';
							}
							formAlert('danger', messageError);
							$('.btn-primary').attr("disabled", false);
						}
					});
				} else {
					formData.append('location', location_id);
					$.ajax({
						url: '/api/user-location-images/',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						success: function (data) {
							console.log(data);
							window.location.href = "/profile/list-businesses/";
						},
						fail: function (data) {
							var messageError = ''
							for (var key in data.responseJSON) {
								var obj = data.responseJSON[key];
								messageError = messageError + obj + '<br>';
							}
							formAlert('danger', messageError);
							$('.btn-primary').attr("disabled", false);
						}
					});
				}
			})
				.fail(function (data) {
					var messageError = ''
					for (var key in data.responseJSON) {
						var obj = data.responseJSON[key];
						messageError = messageError + obj + '<br>';
					}
					formAlert('danger', messageError);
					$('.btn-primary').attr("disabled", false);
				});
		});
	});
	var text_max = 500;
	$('#textarea_feedback').html(text_max + ' characters remaining');

	$('#work_place_description').keyup(function () {
		var text_length = $('#work_place_description').val().length;
		var text_remaining = text_max - text_length;

		$('#textarea_feedback').html(text_remaining + ' characters remaining');
	});
});