$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

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

		if(userType == CONST.USER.JOBSEEKER){
			$.when(
				verifyIfHasPitch(user, query),
				verifyIfHasPostcodeLookup(user, query)

			).done(function(existsPitch, postcodeIsEmpty) {
				if(existsPitch === false || postcodeIsEmpty){
					$('.job-seeker-profile-incomplete').show();

					if( ! (existsPitch === false && postcodeIsEmpty)){
						$('#btn-edit-pitch, #btn-job-preferences').addClass('col-sm-offset-3');
					}
				} else {
					$('.job-seeker-profile-complete').show();
				}
			});

		}

	});

	function verifyIfHasPitch(user, query) {
		return $.get( "/api/job-seekers/"+user.job_seeker, query)
		.then(function( jobSeeker ) {
			console.log(jobSeeker);

			var existsPitch = checkPitchesIfExists('video', jobSeeker.pitches);
			if(existsPitch === false){
				$('#btn-edit-pitch').show();
			}

			return existsPitch;
		});
	}

	function verifyIfHasPostcodeLookup(user, query) {
		return $.get( "/api/job-profiles?id="+user.job_seeker, query)
		.then(function( jobPreferences ) {
			console.log(jobPreferences);

			var postcode = jobPreferences[0].postcode_lookup;
			var postcodeIsEmpty = true;

			if(postcode !== undefined && postcode !== null && postcode !== ''){
				postcodeIsEmpty = false;
			} else {
				$('#btn-job-preferences').show();
			}

			return postcodeIsEmpty;
		});
	}


});

