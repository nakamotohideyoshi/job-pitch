
$(function() {
	app(context).then(function() {
		var query = {
			token: getCookie('key'),
			csrftoken: getCookie('csrftoken')
		};

		$.get( "/api-rest-auth/user/", query)
		.done(function( user ) {
			var userType = CONST.USER.JOBSEEKER;
			if (user.businesses.length){ // business
				userType = CONST.USER.BUSINESS;
			}

			$.get( "/api/application-statuses/", query)
			.done(function(statuses) {
				var index = _.findIndex(statuses, ['name', CONST.APPLICATION.CONNECTION]);
				var status = statuses[index];

				var job_id = QueryString.job;
				if(!_.isEmpty(job_id)){
					query.job = job_id // Recruiter looking for applications of a job
				}
				query.status = status.id;

				$.get( "/api/applications/", query)
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
						$('.business-link').show();
					}

				})
				.fail(function( data ) {
					console.log( data );
				});
			});
		});
	});
});
