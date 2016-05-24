	function goToMessages(id){
		window.location.href = "/messages/?id="+id;
	}
	function goToUserProfile(id){
		window.location.href = "/profile/list-jobs/?id="+id;
	}

$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	var query = {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	};

	$.get( "/api-rest-auth/user/", query)
	.done(function( user ) {
		var businessUser = 0;
		if (user.businesses.length){ // business
			businessUser = 1;
		}

		$.get( "/api/application-statuses/", query)
		.done(function(statuses) {
			var index = _.findIndex(statuses, ['name', 'ESTABLISHED']);
			var status = statuses[index];

			var job_id = QueryString.job;
			if(job_id !== undefined && job_id !== ''){
				query.job = job_id // Recruiter looking for applications of a job
			}

			$.get( "/api/applications/", query)
			.done(function( applications ) {
				var fiteredApplications = _.filter(applications, {'status': status.id});

				if(fiteredApplications.length != 0){
					for (var key in fiteredApplications) {
						var obj = fiteredApplications[key];
						var imageThumb = '';
						var latest_message = obj.messages[obj.messages.length - 1];
						var length = 60;
						var messageShort = latest_message.content.substring(0, length);
						var date = new Date(latest_message.created);
						var minutesTwoDigitsWithLeadingZero = ("0" + date.getMinutes()).substr(-2);

						if(businessUser == 1){ //business
							if(obj.status == 3){ //if deleted
								$('#list-table tbody')
								.append('<tr data-application-id="'+obj.id+'" class="application-list inactive" id="application-list-'+obj.id+'"><td>'+obj.job_data.title+'</td><td>'+obj.job_seeker.first_name+' '+obj.job_seeker.last_name+'</td><td>'+obj.job_seeker.description+'</td><td>'+messageShort+'...<br><span class="message-time-date">'+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+'</span></td><td>Deleted</td></tr>');
							}else{
								$('#list-table tbody')
								.append('<tr data-application-id="'+obj.id+'" class="application-list" id="application-list-'+obj.id+'"><td>'+obj.job_data.title+'</td><td onclick="viewPitch2(\''+obj.job_seeker.pitches[0].video+'\','+obj.job_data.id+','+obj.job_seeker.id+');">'+obj.job_seeker.first_name+' '+obj.job_seeker.last_name+'</td><td>'+obj.job_seeker.description+'</td><td onclick="goToMessages('+obj.id+');">'+messageShort+'...<br><span class="message-time-date">'+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+'</span></td><td><a class="delete-action-btn btn btn-primary" href="javascript:deleteRowApplication('+obj.id+' , \'application-list-\');"><i class="fa fa-trash-o"></i></a></td></tr>');
							}
						}else{ //job seeker
							if(obj.status == 3){ //if deleted
								$('#list-table tbody')
								.append('<tr data-application-id="'+obj.id+'" class="application-list inactive" id="application-list-'+obj.id+'"><td>'+obj.job_data.title+'</td><td>'+messageShort+'...<br><span class="message-time-date">'+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+'</span></td></tr>');
							}else{
								$('#list-table tbody')
								.append('<tr data-application-id="'+obj.id+'" class="application-list" id="application-list-'+obj.id+'"><td>'+obj.job_data.title+'</td><td onclick="goToMessages('+obj.id+');">'+messageShort+'...<br><span class="message-time-date">'+date.getHours()+':'+minutesTwoDigitsWithLeadingZero+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+'</span></td></tr>');
							}
						}
					}
					$('#list-table').show();
				}else{
					$('#list-table').hide();
					$('#no-items-create').show();
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
});