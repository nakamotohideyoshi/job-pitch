$(function() {
	app(context).then(function() {
		$.get("/api/application-statuses/", context.csrftoken)
		.done(function(statuses) {
			var query = context.csrftoken;
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
					renderApplications(context.userType, fiteredApplications, $('#list-table tbody'));

					$('#list-table').show();
				}else{
					$('#list-table').hide();
					$('#no-items-create').show();
				}

				if (context.userType == CONST.USER.BUSINESS){
					// business
					$('.business-link').show();
				}else{
					$('.business-link').hide();
					$('.job-seeker-link').show();
				}
			});
		});
	});
});
