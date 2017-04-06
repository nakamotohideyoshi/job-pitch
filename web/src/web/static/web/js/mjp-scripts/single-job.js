$(function () {
	app(context).then(function() {
		$('#job_applied_for').hide();

		//grab location id from url
		var job_id = QueryString.id;

		$.get('/api-rest-auth/user/', {
			csrftoken: getCookie('csrftoken')
		}).done(function (data) {
			var href = "javascript:applyForJob(" + job_id + "," + data.job_seeker + ");";

			$('#applyButton').attr("href", href);
		});


		$.get("/api/jobs/" + job_id, {
			csrftoken: getCookie('csrftoken')
		}).done(function (data) {
			$('.job-title').html(data.title);
			$('.job-description').html(data.description);
			$('.image-job').attr('src', data.images[0].image);
			$('.image-job').show();
			$.get("/api/hours/" + data.hours, { csrftoken: getCookie('csrftoken') }).done(function (data) {
				$('.job-hours').html(data.name);
			});
			$.get("/api/contracts/" + data.contract, { csrftoken: getCookie('csrftoken') }).done(function (data) {
				$('.contract-type').html(data.name);
			});
			$.get("/api/sectors/" + data.sector, { csrftoken: getCookie('csrftoken') }).done(function (data) {
				$('.job-sector').html(data.name);
			});
		});
	});
});
