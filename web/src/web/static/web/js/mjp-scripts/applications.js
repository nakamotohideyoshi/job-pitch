
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var query = {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	};

	$.get("/api-rest-auth/user/", query)
	.done(function( user ) {
		var userType = CONST.USER.JOBSEEKER;
		if (user.businesses.length){ // business
			userType = CONST.USER.BUSINESS;
		}

		$.get("/api/application-statuses/", query)
		.done(function(statuses) {
			var index = _.findIndex(statuses, ['name', CONST.APPLICATION.APPLICATION]);
			var status = statuses[index];

			var job_id = QueryString.job;
			if(job_id !== undefined && job_id !== ''){
				query.job = job_id // Recruiter looking for applications of a job
			}
			query.status = status;

			$.get("/api/applications/", query)
			.done(function( applications ) {
				var fiteredApplications = _.filter(applications, {'status': status.id});

				if( ! _.isEmpty(fiteredApplications)){
					renderApplications(userType, fiteredApplications, $('#list-table tbody'));

					$('#list-table').show();
				}else{
					$('#list-table').hide();
					$('#no-items-create').show();
				}

				if (userType == CONST.USER.BUSINESS){
					// business
					$('.business-link').show();
				}else{
					$('.business-link').hide();
					$('.job-seeker-link').show();
				}
			})
			.fail(function( data ) {
			});

		});

	});

});