
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

			if((application.status == CONST.STATUS.APPLICATION && userType == CONST.USER.JOBSEEKER)
				|| application.status == CONST.STATUS.CONNECTION
			){
				$('.extra-functionality').removeClass('hide');
			}

			if(application.status == CONST.STATUS.CONNECTION){
				$('.send-message-functionality').removeClass('hide');
			}

			var job = application.job_data;
			var business = job.business_data;
			var location = job.location_data;
			var jobSeeker = application.job_seeker;

			console.log(data);
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

			if( ! _.isEmpty(jobSeeker.pitches[0])){
				$('#job-seeker-pitch').html('<video width="240" height="180" controls><source src="'+jobSeeker.pitches[0].video+'" type="video/mp4"></video>');
			}
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


			if(job.images.length != 0){
				$('.job-image-messages').attr('src', job.images[0].image);
			}else if(location.images.length != 0){
				$('.job-image-messages').attr("src", location.images[0].image);
			}else{
				console.log(business.images[0].image);
				$('.job-image-messages').attr("src", business.images[0].image);
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

			for (var key in data.messages) {
				var obj = data.messages[key];
					  messageRead(obj.id);
					  var length = 55;
					  var date = new Date(obj.created);
					  var minutesTwoDigitsWithLeadingZero = ("0" + date.getMinutes()).substr(-2);
					  var readText = '';
					  if(obj.read){
						  readText  = ' - Message Read';
					  }
					  if(obj.from_role == recruiter_role.id){
						  if(obj.system == true){
							$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+jobSeeker.id+');" class="col-sm-2">'+location.business_data.name+'<br><span class="systemMessageNotice">(system generated)</span></td><td class="col-sm-10">'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');
						  }else{
							$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+jobSeeker.id+');">'+location.business_data.name+'</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');
						  }
					  }else{
						  if(obj.system == true){
							$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+jobSeeker.id+');">System</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');
						  }else{
						$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+jobSeeker.id+');">'+jobSeeker.first_name+' '+jobSeeker.last_name+'</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');
						  }
					  }
			}

	  }).fail(function( data ) {
			console.log( data );
	  });

		//Form submit code
		$('#send-messages').submit(function( event ) {
			$('.btn-default').attr( "disabled", true );
			event.preventDefault();
			var content = $('#content-form').val();
				$.post( "/api/messages/", { application:application_id,content:content, csrftoken: getCookie('csrftoken') }).done(function( data ) {
					$('#content-form').val('');
					location.reload();
				  })
				  .fail(function( data ) {
					console.log( data.responseJSON );
				  });
		});
	});
});