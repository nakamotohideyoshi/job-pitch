function populateCompanies(query, companyid) {
	$.get("/api/user-businesses/", query).done(function (data) {
		var selected = '';
		var options = '';

		data.forEach(function (obj) {
			selected = '';
			if (companyid && obj.id == companyid) {
				selected = 'selected=""';
			}

			options += '<option value="' + obj.id + '" ' + selected + '>' + obj.name + '</options>';
		});

		$('#company').append(options);

		if (companyid) {
			$('#company').trigger('change');
			$('#company').attr('disabled', true)
		}
	});
}

function findStaffForJob(job_id, query) {
	formAlert('info', 'Wait...');

	$.get("/api/job-seekers/?job=" + job_id, query)
		.done(function (data) {
			console.log(data);
			for (var key in data) {
				var obj = data[key];
				console.log(obj);
				var imageThumb = '';
				var length = 60;
				var descriptionShort = obj.description.substring(0, length);
				if (obj.pitches.length != 0) {
					if (obj.pitches[0].thumbnail != null) {
						imageThumb = obj.pitches[0].thumbnail;
					}
				}
				if (imageThumb != '') {
					$('#list-table tbody').append('<tr data-job-seeker-id="' + obj.id + '" class="job-seeker-list" id="job-seeker-list-' + obj.id + '"><td onclick="viewPitch(\'' + obj.pitches[0].video + '\',' + job_id + ',' + obj.id + ');"><img width="150px" src="' + imageThumb + '"></td><td onclick="viewPitch(\'' + obj.pitches[0].video + '\',' + job_id + ',' + obj.id + ');">' + obj.first_name + ' ' + obj.last_name + '</td><td>' + descriptionShort + '</td></tr>');
				} else {
					$('#list-table tbody').append('<tr data-job-id="' + obj.id + '" class="job-list" id="job-list-' + obj.id + '"><td onclick="viewPitch(\'' + obj.pitches[0].video + '\',' + job_id + ',' + obj.id + ');"><img width="150px" src="/static/web/images/no_image_available.png"></td><td onclick="viewPitch(\'' + obj.pitches[0].video + '\',' + job_id + ',' + obj.id + ');">' + obj.first_name + ' ' + obj.last_name + '</td><td>' + descriptionShort + '</td></tr>');
				}
			}
			if (data.length == 0) {
				$('#noJobsMatching').show();
				$('.main-job-seeker-list').hide();
			} else {
				$('.main-job-seeker-list').show();
				$('#noJobsMatching').hide();
			}
		})
		.fail(function (data) {
			$('#profileNon').show();
		});
}


$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var query = {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	};

	//grab location id from url
	var job_id = QueryString.id;

	if (job_id !== undefined) {
		findStaffForJob(job_id, query);
	} else {
		populateCompanies(query);

		$("#company").change(function () {
			if ($(this).val() != '') {
				$.get("/api/user-locations/", _.assign({
						business: $(this).val()
					},
					query
				)).done(function (data) {
					populateSelect($('#location'), data);
					$('#locationSelect').show();
				});
			}
		});

		$("#location").change(function () {
			if ($(this).val() != '') {
				$.get("/api/user-jobs/", _.assign({
						location: $(this).val()
					},
					query
				)).done(function (data) {
					console.log(data);
					if (data.length != 0) {
						populateSelect($('#job'), data);
						$('#jobSelect').show();
					}
				});
			}
		});

		$("#job").change(function () {
			if ($(this).val() != '') {
				findStaffForJob($(this).val(), query);
			}
		});

	}
});

