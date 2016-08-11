$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	$('#work_place_details').show();
	//grab business id from url
	var business_id = QueryString.id;

	$('#business').val(business_id);
	$('#work_place_details').show();
	$.get("/api/user-businesses/" + business_id, {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		var src;
		if (data.images.length)
			src = data.images[0].thumbnail;
		else
			src = "/static/web/images/no_image_available.png";
		$('#currentLogo').attr('src', src).show();
		$('.login-email').append($('<h6 id="header-company">'+data.name + ' ('+data.tokens+' tokens)</h6>'));
	});

	$('#work_place_details').submit(function (event) {
		clearErrors();
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
				postcode_lookup: work_place_location,
				place_name: postcodeData.nuts
			}).done(function (data) {
				$('#location').val(data.id);
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
							window.location.href = "/profile/list-locations/?id=" + business_id;
						}
					});
				} else {
					$.get("/api/user-businesses/" + business_id, {
						token: getCookie('key'),
						csrftoken: getCookie('csrftoken')
					}).done(function (data) {
						var src;
						if (data.images.length)
							src = data.images[0].thumbnail;
						else
							src = "/static/web/images/no_image_available.png";
                        $('#currentLogo').attr('src', src).show();
						var xhr = new XMLHttpRequest();
						xhr.onreadystatechange = function () {
							if (this.readyState == 4 && this.status == 200) {
								//this.response is what you're looking for
								$('#work_place_image').remove();
								var formData2 = new FormData($('#work_place_details')[0]);
								formData2.append('image', this.response, 'location-' + business_id + '-' + $('#location').val() + '.' + data.images[0].image.split('.').pop());
								$.ajax({
									url: '/api/user-location-images/',
									type: 'POST',
									data: formData2,
									cache: false,
									contentType: false,
									processData: false,
									success: function (data) {
										window.location.href = "/profile/list-locations/?id=" + business_id;
									}
								});
							}
						}
						xhr.open('GET', data.images[0].image);
						xhr.responseType = 'blob';
						xhr.send();

					});

				}
			})
				.fail(function (data) {
					/*var messageError = ''
					for (var key in data.responseJSON) {
						var obj = data.responseJSON[key];
						messageError = messageError+obj+'<br>';
					}
					formAlert('danger', messageError);
					$('.btn-primary').attr( "disabled", false );*/
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
	});
});