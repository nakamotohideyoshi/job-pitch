
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var application_id = QueryString.id;

	var recruiter_role;
	var job_seeker_role;

	//Get other data
	var query = {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	}

	$.get( "/api/roles/", query)
	.done(function( roles ) {
		for (var key in roles) {
			var role = roles[key];
			if(role.name == CONST.ROLE.RECRUITER){
				recruiter_role = role;

			}else if(role.name == CONST.ROLE.JOBSEEKER){
				job_seeker_role = role;
			}
		}
	})
	.fail(function( data ) {
		console.log( data );
	});

	$.get("/api-rest-auth/user/", query)
	.done(function( data ) {
		var userType = CONST.USER.JOBSEEKER;
		if ( ! _.isEmpty(data.businesses)){
			// business
			userType = CONST.USER.BUSINESS;
		}

		if(userType == CONST.USER.BUSINESS){
			$('.job-seeker-details-messages').show();
		}else{
			$('.job-details-messages').show();
		}

		var job_id = QueryString.job;
		if(job_id !== undefined && job_id !== ''){
			query.job = job_id // Recruiter looking for applications of a job
		}

		$.get( "/api/applications/", query)
		.done(function( applications ) {
			var applicationId = QueryString.id * 1;

			var index = _.findIndex(applications, ['id', applicationId]);
			var application = applications[index];

			var job = application.job_data;
			var business = job.business_data;
			var location = job.location_data;
			var jobSeeker = application.job_seeker;
			var messages = application.messages;

			if((application.status == CONST.STATUS.APPLICATION && userType == CONST.USER.JOBSEEKER)
				|| application.status == CONST.STATUS.CONNECTION
			){
				$('.extra-functionality').removeClass('hide');
			}

			if(application.status == CONST.STATUS.CONNECTION){
				$('.send-message-functionality').removeClass('hide');
			}

			$('#job-title-single').html(job.title);

			$.get("/api/hours/"+job.hours, query)
			.done(function( data ) {
				$('#job-hours-single').html(data.name);
			});

			$.get("/api/contracts/"+job.contract, query)
			.done(function( data ) {
				$('#contract-type-single').html(data.name);
			});

			$.get( "/api/sectors/"+job.sector, query)
			.done(function( data ) {
				$('#job-sector-single').html(data.name);
			});

			$('#location-name-single').html(location.name);
			$('#location-description-single').html(location.description);
			$('#location-address-single').html(location.address);
			$('#location-place-name-single').html(location.place_name);

			var html = getHtmlForVideoOrThumbnail(jobSeeker.pitches);
			$('#job-seeker-pitch').html(html);

			$('#job-seeker-name').html(jobSeeker.first_name+' '+jobSeeker.last_name);
			$('#job-seeker-description').html(jobSeeker.description);

			if(application.status !== CONST.STATUS.CONNECTION){
				if(!jobSeeker.sex_public){
					$('.job-seeker-sex').remove();
				}
				if(!jobSeeker.age_public){
					$('.job-seeker-age').remove();
				}
				if(!jobSeeker.nationality_public){
					$('.job-seeker-nationality').remove();
				}
			}

			$('#job-seeker-sex').html(jobSeeker.sex);
			$('#job-seeker-age').html(jobSeeker.age);
			$('#job-seeker-nationality').html(jobSeeker.nationality);

			var urlJobImage = null;
			if(job.images.length != 0){
				urlJobImage = job.images[0].image;
			}else if(location.images.length != 0){
				urlJobImage = location.images[0].image;
			}else{
				urlJobImage = business.images[0].image;
			}
			if(urlJobImage && urlExists(urlJobImage)){
				$('.job-image-messages').attr('src', urlJobImage);
			}

			var LatLng = {lat: location.latitude, lng: location.longitude};
			var map = new google.maps.Map(document.getElementById('map'), {
				center: LatLng,
				zoom: 12
			});

			var marker = new google.maps.Marker({
				position: LatLng,
				map: map,
				title: location.name
			});

			if( ! _.isEmpty(messages)){
				$('#list-table tbody').html('');

				var templateFile = CONST.PATH.PARTIALS+'messageRow.html';
				$('<div>').load(templateFile,function(content){
					var template = _.template(content);

					for (var key in messages) {
						var message = messages[key];
						messageRead(message.id);
						var length = 55;
						var readText = '';
						if(message.read){
							readText  = ' - Message Read';
						}

						var context = {
							jobSeeker: jobSeeker,
							message: message,
							sender: location.business_data.name,
							colSenderSize: ''
						};

						var date = new Date(message.created);
						context.messageTimeDate = date.getHours()+':'+_.padStart(date.getMinutes(),2,'0')
								+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear();

						if(message.from_role == recruiter_role.id){
							context.colSenderSize = 'col-sm-2';
						}else{
							context.sender = jobSeeker.first_name+' '+jobSeeker.last_name;

							if(message.system){
								context.sender = 'System';
							}
						}

						$('#list-table tbody').append(template(context));
					}
				});
			}

		}).fail(function( data ) {
			console.log( data );
		});

		//Form submit code
		$('#send-messages').submit(function( event ) {
			$('.btn-default').attr( "disabled", true );
			event.preventDefault();

			var content = $('#content-form').val();

			query.application = application_id;
			query.content = content;


			$.post( "/api/messages/", query)
			.done(function( data ) {
				$('#content-form').val('');
				// TODO: insert the new message into the page, rather than reloading
				location.reload(); // TODO: Should only happen on success.

			}).fail(function( data ) {
				console.log( data.responseJSON ); // TODO: Need user indication of message failure.
			});
		});
	});
});