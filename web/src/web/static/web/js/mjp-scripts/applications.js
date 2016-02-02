	function goToMessages(id){
        window.location.href = "/messages/?id="+id;
    }
	function goToUserProfile(id){
        window.location.href = "/profile/list-jobs/?id="+id;
    }

$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	var job_id = QueryString.job;
	
	var job_refine = '';
	
	if(job_id === undefined){
	}else{
		job_refine = '?job='+job_id;
	}
	
	var businessUser = 0;
	
	$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
							if (data.businesses.length){
								// business
								businessUser = 1;
							}
						  
	
			$.get( "/api/applications/"+job_refine, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
						console.log( data );
						for (var key in data) {
								  var obj = data[key];
								  var imageThumb = '';
								  var latest_message = obj.messages[obj.messages.length - 1];
								  var length = 60;
								  var messageShort = latest_message.content.substring(0, length);
								  var date = new Date(latest_message.created);
								  var minutesTwoDigitsWithLeadingZero = ("0" + date.getMinutes()).substr(-2);
								  if(businessUser == 1){
									  //business
									$('#list-table tbody').append('<tr data-application-id="'+obj.id+'" class="application-list" id="application-list-'+obj.id+'"><td>'+obj.job_data.title+'</td><td onclick="viewPitch2(\''+obj.job_seeker.pitches[0].video+'\','+obj.job_data.id+','+obj.job_seeker.id+');">'+obj.job_seeker.first_name+' '+obj.job_seeker.last_name+'</td><td>'+obj.job_seeker.description+'</td><td onclick="goToMessages('+obj.id+');">'+messageShort+'...<br><span class="message-time-date">'+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+'</span></td></tr>');
								  }else{
									  //job seeker
									$('#list-table tbody').append('<tr data-application-id="'+obj.id+'" class="application-list" id="application-list-'+obj.id+'"><td>'+obj.job_data.title+'</td><td onclick="goToMessages('+obj.id+');">'+messageShort+'...<br><span class="message-time-date">'+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+'</span></td></tr>');
								  }
		
							  }
							  
								if (businessUser == 1){
									// business
									$('.business-link').show();
								}
							  
					  })
					  .fail(function( data ) {
						console.log( data );
					  });
			  
		});


});