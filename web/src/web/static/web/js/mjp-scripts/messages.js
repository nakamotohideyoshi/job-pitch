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
	
	$.get( "/api/applications/"+application_id, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
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
						  		$('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+data.job_seeker.id+');">System</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+readText+'</td></tr>');
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
		event.preventDefault();
		var content = $('#content-form').val();
			$.post( "/api/messages/", { application:application_id,content:content, csrftoken: getCookie('csrftoken') }).done(function( data ) {
				location.reload();
			  })
			  .fail(function( data ) {
				console.log( data.responseJSON );
			  });
	});

});