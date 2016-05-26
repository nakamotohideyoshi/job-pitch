function renderApplication(template, application, $container){
	var imageThumb = '';

	var length = 60;
	var latest_message = application.messages[application.messages.length - 1];
	var messageShort = latest_message.content.substring(0, length);

	var date = new Date(latest_message.created);
	var messageTimeDate = date.getHours()+':'+_.padStart(date.getMinutes(),2,'0')
			+' '+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear();

	var video = '';
	if( ! _.isEmpty(application.job_seeker.pitches[0])){
		video = application.job_seeker.pitches[0].video;
	}

	var isDeleted = (application.status == CONST.APPLICATION.DELETED);
	var inactiveClass = isDeleted ? 'inactive' : '';

	var context = {
		application: application,
		video: video,
		messageShort: messageShort,
		date: date,
		messageTimeDate: messageTimeDate,
		isDeleted: isDeleted,
		inactiveClass: inactiveClass
	};

	$container.append(template(context));
}


function renderApplications(userType, applications, $container){
	var templateFile = CONST.PATH.PARTIALS+'jobseekerRowApplication.html';

	if(userType == CONST.USER.BUSINESS){
		templateFile = CONST.PATH.PARTIALS+'businessRowApplication.html';
	}

	// Loading the template into dummy div for render application
	$('<div>').load(templateFile,function(content){
		var template = _.template(content);

		for (var key in applications) {
			renderApplication(template, applications[key], $container);
		}
	});
}


function goToMessages(id){
	window.location.href = "/messages/?id="+id;
}


function goToUserProfile(id){
	window.location.href = "/profile/list-jobs/?id="+id;
}
