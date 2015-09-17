$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	var application_id = QueryString.id;
	
	$.get( "/api/applications/"+application_id, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
				console.log( data );
				for (var key in data.messages) {
					var obj = data.messages[key];
					console.log(obj);
						  var length = 55;
						  var date = new Date(obj.created);
						  var minutesTwoDigitsWithLeadingZero = ("0" + date.getMinutes()).substr(-2);
						  $('#list-table tbody').append('<tr data-message-id="'+obj.id+'" class="message-list" id="message-list-'+obj.id+'"><td onclick="goToUserProfile('+data.job_seeker.id+');">'+data.job_seeker.first_name+' '+data.job_seeker.last_name+'</td><td>'+obj.content+'<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+'</td></tr>');
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
				console.log(data);
			  })
			  .fail(function( data ) {
				console.log( data.responseJSON );
			  });
	});

});