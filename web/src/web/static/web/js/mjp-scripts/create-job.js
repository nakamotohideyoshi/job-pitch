function populateCompanies(companyid) {
	$.get("/api/user-businesses/", {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		var selected = '';
		for (var key in data) {
			var obj = data[key];

			selected = '';
			if (companyid && obj.id == companyid) {
				selected = 'selected=""';
			}

			$('#company').append('<option value="' + obj.id + '" ' + selected + '>' + obj.name + '</options>');
		}

		if (companyid) {
			$('#company').trigger('change');
			$('#company').attr('disabled', true)
		}
	});
}


$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	//grab company id from url
	var company_id = QueryString.companyid;

	//grab location id from url
	var location_id = QueryString.id;

	//variables defined
	var open_job_status;

	$("#company").change(function () {
		if ($(this).val() != '') {
			$.get("/api/user-locations/", {
				business: $(this).val(),
				csrftoken: getCookie('csrftoken')
			}).done(function (data) {
				for (var key in data) {
					var obj = data[key];

					selected = '';
					if (location_id && obj.id == location_id) {
						selected = 'selected=""';
					}

					$('#location').append('<option value="' + obj.id + '" ' + selected + ' >' + obj.name + '</options>');
				}

				$('#locationSelect').show();

				if (location_id) {
					$('#location').trigger('change');
					$('#location').attr('disabled', true)
				}
			});
		} else {
			$('#locationSelect').hide();
			$("#location").val('');
		}
	});

	$("#location").change(function () {
		if ($(this).val() != '') {
			$('#mainFormAreaCreateJob').show();
			location_id = $(this).val();
			$.get("/api/user-locations/" + location_id, {
				token: getCookie('key'),
				csrftoken: getCookie('csrftoken')
			}).done(function (data) {
				$('#currentLogo').attr('src', data.images[0].thumbnail).show();
			});
		} else {
			$('#locationSelect').hide();
			$('#mainFormAreaCreateJob').hide();
			$("#location").val('');
		}
	});

	//Populate Companies and Locations selects
	populateCompanies(company_id);

	//if location id is set then go ahead with populating the fields and do other functions
	if (typeof location_id !== "undefined") {

		$.get("/api/user-locations/" + location_id, {
			token: getCookie('key'),
			csrftoken: getCookie('csrftoken')
		}).done(function (data) {
			$('#currentLogo').attr('src', data.images[0].thumbnail).show();
		});

		$.get("/api/user-locations/" + location_id, {
			token: getCookie('key'),
			csrftoken: getCookie('csrftoken')
		}).done(function (data) {

			$('#company').val(data.business_data.id);

			$.get("/api/user-locations/", {
				business: $('#company').val(),
				csrftoken: getCookie('csrftoken')
			}).done(function (data) {
				for (var key in data) {
					var obj = data[key];
					$('#location').append('<option value="' + obj.id + '">' + obj.name + '</options>');
				}
				$('#location').val(location_id);
				$('#locationSelect').show();

			});

			$('#mainFormAreaCreateJob').show();
		});

	}

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
			$('#job_sector').append('<option value="' + obj.id + '">' + obj.name + '</options>');
		}
	});

	//Get other data

	$.get("/api/job-statuses/", {
		csrftoken: getCookie('csrftoken')
	}).done(function (data) {
		for (var key in data) {
			var obj = data[key];
			if (obj.name == "OPEN") {
				open_job_status = obj.id;
			}
		}
	});

	//Form submit code
	$('#create-job').submit(function (event) {
		$('.btn-primary').attr("disabled", true);
		event.preventDefault();
		var title = $('#title').val();
		var description = $('#description').val();
		var job_sector = $('#job_sector').val();
		var contract = $('#contract').val();
		var hours = $('#hours').val();

		$.post("/api/user-jobs/", {
			title: title,
			description: description,
			sector: job_sector,
			contract: contract,
			hours: hours,
			location: location_id,
			status: open_job_status,
			csrftoken: getCookie('csrftoken')
		}).done(function (data) {
			$('#job_id').val(data.id);
			if ($('#job_image').val() != '') {
				var formData = new FormData($('#create-job')[0]);
				$.ajax({
					url: '/api/user-job-images/',
					type: 'POST',
					data: formData,
					cache: false,
					contentType: false,
					processData: false,
					success: function (data) {
						window.location.href = "/profile/list-jobs/?id=" + location_id;
					}
				});
			} else {
				//window.location.href = "/profile/list-jobs/?id="+location_id;
				$.get("/api/user-locations/" + location_id, {
					token: getCookie('key'),
					csrftoken: getCookie('csrftoken')
				}).done(function (data) {
					$('#currentLogo').attr('src', data.images[0].thumbnail).show();
					var xhr = new XMLHttpRequest();

					xhr.onreadystatechange = function () {
						if (this.readyState == 4 && this.status == 200) {
							//this.response is what you're looking for
							$('#job_image').remove();
							var formData = new FormData($('#create-job')[0]);

							formData.append('image', this.response, 'location-' + location_id + '.' + data.images[0].image.split('.').pop());

							$.ajax({
								url: '/api/user-job-images/',
								type: 'POST',
								data: formData,
								cache: false,
								contentType: false,
								processData: false,
								success: function (data) {
									window.location.href = "/profile/list-jobs/?id=" + location_id;
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

	var text_max = 500;

	$('#textarea_feedback').html(text_max + ' characters remaining');

	$('#description').keyup(function () {
		var text_length = $('#description').val().length;
		var text_remaining = text_max - text_length;

		$('#textarea_feedback').html(text_remaining + ' characters remaining');
	});
});