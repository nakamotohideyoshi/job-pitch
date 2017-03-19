function populateSelect($select, data) {
	data.forEach(function(obj) {
		$select.append(
			'<option value="' + obj.id + '">' + obj.name + '</options>'
		);
	});
}

$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var query = {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	};

	//$("#status_job").bootstrapToggle();

	//grab job_id id from url
	var job_id = QueryString.id;

	//variables defined
	var open_job_status;
	var closed_job_status;
	var location_id;

	//Populate selects
	$.get("/api/hours/", query).done(function(data) {
		populateSelect($('#hours'), data);
	});

	$.get("/api/contracts/", query).done(function(data) {
		populateSelect($('#contract'), data);
	});

	$.get("/api/sectors/", query).done(function(data) {
		populateSelect($('#job_sector'), data);
	});

	//Get other data

	$.get("/api/job-statuses/", query).done(function(data) {
		data.forEach(function(obj) {
			if (obj.name == "OPEN") {
				open_job_status = obj.id;
			} else if (obj.name == "CLOSED") {
				closed_job_status = obj.id;
			}
		});
	});

	// Populate any fields that have data

	$.get("/api/user-jobs/" + job_id, query).done(function(data) {
		if (data.status == closed_job_status) {
			//$('#status_job').bootstrapToggle(); //('toggleState');
		}
		$('.bootstrap-switch-label').css('font-size', '13px');

		if (data.title != null) {
			$('#title').val(data.title);
		}
		if (data.description != null) {
			$('#description').val(data.description);
		}
		if (data.sector != null) {
			$('#job_sector').val(data.sector);
		}
		if (data.contract != null) {
			$('#contract').val(data.contract);
		}
		if (data.hours != null) {
			$('#hours').val(data.hours);
		}

		location_id = data.location;
	});

	//Form submit code
	$('#create-job').submit(function(event) {

		$('.btn-primary').prop("disabled", true);

		event.preventDefault();

		var job = {
			title: $('#title').val(),
			description: $('#description').val(),
			sector: $('#job_sector').val(),
			contract: $('#contract').val(),
			hours: $('#hours').val(),
			location: location_id,
			status: status_job,
			csrftoken: getCookie('csrftoken')
		};

		job.status = closed_job_status;
		if ($('#status_job').is(':checked')) {
			job.status = open_job_status;
		}

		$.put("/api/user-jobs/" + job_id + "/", job).done(function(data) {
			$('#job_id').val(data.id);

			formAlert('success', 'Successfully Updated! <br><a href="/find-posts/?id=' + location_id + '">Back to Job List</a>');

			//window.location.href = "/find-posts/?id="+location_id;
			setTimeout(function() {
				$('.btn-primary').attr("disabled", false);
				$('.alert').hide();
			}, 5000);

		}).fail(function(data) {
			var messageError = '';

			//for (var key in data.responseJSON) {
			//var obj = data.responseJSON[key];
			messageError = messageError + data.statusText + '<br>';
			//}

			formAlert('danger', messageError);

			$('.btn-primary').attr("disabled", false);
		});
	});

	var text_max = 500;
	$('#textarea_feedback').html(text_max + ' characters remaining');

	$('#description').keyup(function() {
		var text_length = $('#description').val().length;
		var text_remaining = text_max - text_length;

		$('#textarea_feedback').html(text_remaining + ' characters remaining');
	});
});