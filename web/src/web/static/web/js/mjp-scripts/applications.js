	function goToMessages(id){
        window.location.href = "/messages/?id="+id;
    }
	function goToUserProfile(id){
        window.location.href = "/profile/list-jobs/?id="+id;
    }

$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	$.get( "/api/applications/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
				console.log( data );
				for (var key in data) {
						  var obj = data[key];
						  var imageThumb = '';
						  console.log(obj);
						  var latest_message = obj.messages[obj.messages.length - 1];
						  var length = 55;
						  var messageShort = latest_message.content.substring(0, length);
						  var date = new Date(latest_message.created);
						  var minutesTwoDigitsWithLeadingZero = ("0" + date.getMinutes()).substr(-2);
							$('#list-table tbody').append('<tr data-application-id="'+obj.id+'" class="application-list" id="application-list-'+obj.id+'"><td>'+obj.job_data.title+'</td><td onclick="goToUserProfile('+obj.job_seeker.id+');">'+obj.job_seeker.first_name+' '+obj.job_seeker.last_name+'</td><td onclick="goToMessages('+obj.id+');">'+messageShort+'...<br>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+' '+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+'</td></tr>');

					  }
			  })
			  .fail(function( data ) {
				console.log( data );
			  });


});