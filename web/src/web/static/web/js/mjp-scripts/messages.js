
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);	
	
	var application_id = QueryString.id;
	
	var recruiter_role;
	var job_seeker_role;
	
	//Get other data
	
	$.get( "/api/roles/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			if(obj.name == "RECRUITER"){
				recruiter_role = obj;
			}else if(obj.name == "JOB_SEEKER"){
				job_seeker_role = obj;
			}
		}
	})
	.fail(function( data ) {
		console.log( data );
	});
	var businessUser = 0;
	
	$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
							if (data.businesses.length){
								// business
								businessUser = 1;
							}
							if(businessUser ==1){
								$('.job-seeker-details-messages').show();
							}else{
								$('.job-details-messages').show();
							}
		$.get( "/api/applications/"+application_id, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
					console.log(data);
					$('#job-title-single').html(data.job_data.title);
					$.get( "/api/hours/"+data.job_data.hours, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
						$('#job-hours-single').html(data.name);
					});
					$.get( "/api/contracts/"+data.job_data.contract, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
						$('#contract-type-single').html(data.name);
					});
					$.get( "/api/sectors/"+data.job_data.sector, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
						$('#job-sector-single').html(data.name);
					});
					$('#location-name-single').html(data.job_data.location_data.name);
					$('#location-description-single').html(data.job_data.location_data.description);
					$('#location-address-single').html(data.job_data.location_data.address);
					$('#location-place-name-single').html(data.job_data.location_data.place_name);
					
					$('#job-seeker-pitch').html('<video width="240" height="180" controls><source src="'+data.job_seeker.pitches[0].video+'" type="video/mp4"></video>');
					$('#job-seeker-name').html(data.job_seeker.first_name+' '+data.job_seeker.last_name);
					$('#job-seeker-description').html(data.job_seeker.description);
					
					if(data.job_data.images.length != 0){
						$('.job-image-messages').attr('src', data.job_data.images[0].image);
					}else if(data.job_data.location_data.images.length != 0){
						$('.job-image-messages').attr("src", data.job_data.location_data.images[0].image);
					}else{
						console.log(data.job_data.business_data.images[0].image);
						$('.job-image-messages').attr("src", data.job_data.business_data.images[0].image);
					}
					var LatLng = {lat: data.job_data.location_data.latitude, lng: data.job_data.location_data.longitude};
					var map = new google.maps.Map(document.getElementById('map'), {
						center: LatLng,
						zoom: 12
					  });
					var marker = new google.maps.Marker({
						position: LatLng,
						map: map,
						title: data.job_data.location_data.name
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
									$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+data.job_seeker.id+');" class="col-sm-2">'+data.job_data.location_data.business_data.name+'<br><span class="systemMessageNotice">(system generated)</span></td><td class="col-sm-10">'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');
								  }else{
									$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+data.job_seeker.id+');">'+data.job_data.location_data.business_data.name+'</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');    
								  }
							  }else{
								  if(obj.system == true){
									$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+data.job_seeker.id+');">System</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');
								  }else{
								$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+data.job_seeker.id+');">'+data.job_seeker.first_name+' '+data.job_seeker.last_name+'</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');  
								  }
							  }
					}
				  })
				  .fail(function( data ) {
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