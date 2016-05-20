// Getting AWS credentials for uploading file to S3
var creds =AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	IdentityPoolId: 'us-east-1:5e01a88d-f24a-45e8-b1f6-dc9e406fb042'
});
AWS.config.credentials = creds;
AWS.config.region = 'us-east-1';

var bucket = new AWS.S3({params: {Bucket: 'mjp-android-uploads'}});

var recordingTimer;

var actualPitch = null;

var job_seeker_id = 0;

$(document).ready(function() {

	$.get( "/api/job-seekers/", { csrftoken: getCookie('csrftoken') })
	.done(function( jobSeeker ) {
		job_seeker_id = jobSeeker[0].id;

		if(jobSeeker[0].pitches[0] !== undefined){
			actualPitch = jobSeeker[0].pitches[0];
			renderVideoContainer(actualPitch);
			poolingTranscodeProcess(actualPitch);
		}
	});


	$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') })
	.done(function( data ) {
		job_seeker_id = data.job_seeker;
	});



	$('.btn-js-start-pitch').click(function(e) {
		// prepare video container;
		$('#pitchVideoCheck video').html('');

		if(onBtnRecordClicked()){
			startRecordingTimer(19, $('.btn-js-stop-pitch'), stopRecordingProcess);
		};
	});


	$('.btn-js-stop-pitch').click(function(e) {
		stopRecordingProcess( $(this) );
	});


	$('.btn-js-upload-pitch').click(function(e) {
		var videoDataContainer = document.getElementById('data');
		var params = {Key: 'pitch-'+job_seeker_id+'.webm', Body: videoDataContainer.value};
		bucket.upload(params, function (err, data) {
			console.log = err ? 'ERROR!' : 'SAVED.';
		});
	});
});


function renderVideoContainer(pitch) {
	if(pitch !== null && pitch !== undefined && pitch.video !== undefined && pitch.video !== null){
		var videoSource = '';

		var videoType = 'video/webm';
		if(pitch.video.indexOf('mp4')>=0){
			videoType = 'video/mp4';
		}

		videoSource = '<source src="'+pitch.video+'" type="'+videoType+'">';

		var htmlVideo = '<video width="320" height="240" controls autoplay>'+videoSource+'</video><br>';
		$('#pitchVideoCheck').html(htmlVideo);
	}
}


function startRecordingTimer(duration, $display, callback) {
	var timer = duration, minutes, seconds;

	recordingTimer = setInterval(function () {
		minutes = parseInt(timer / 60, 10);
		seconds = parseInt(timer % 60, 10);

		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;

		$display.html('Stop (Time Left: <span class="timeLeft">' + minutes + ":" + seconds + '</span>)');

		if (--timer < 0) {
			timer = duration;
			callback($display);
		}
	}, 1000);
}


function stopRecordingProcess($display){
	$display.text('Stop');

	clearInterval(recordingTimer);

	onBtnStopClicked();

	if(rawMediaRecorded != undefined && rawMediaRecorded){
		getNewPitchMetaData(function(pitch){
			putIntoS3Bucket(pitch, rawMediaRecorded);
		});
	}
}


function getNewPitchMetaData(callback) {
	$.ajax({
		url: "/api/pitches/",
		type: 'POST',
		data: { csrftoken: getCookie('csrftoken') },
		cache: false
	})
	.done(function(pitch) {
		callback(pitch);
	});
}


function putIntoS3Bucket(pitch, object){
	log('Start uploading ...');

	object.Key = window.location.origin.replace('//','')
	+ '/' + pitch.token
	+ '.' + pitch.id
	+ '.' + object.Key;

	bucket.putObject(object, function (err, data) {
		if(!err){
			poolingTranscodeProcess(pitch);
		}
		console.log(err ? 'ERROR!' : 'SAVED.');
	});
}


function poolingTranscodeProcess(pitch){
	var firstExecution = true;

	poolingInterval = setInterval(function(){
		$.ajax({
			url: "/api/pitches/",
			type: 'GET',
			cache: false
		}).done(function( pitches ) {
			if(pitches !== undefined && pitches.length > 0){
				var thereIsANullPitch = false;

				pitches.forEach(function(pitch) {
					if(pitch.video == undefined || pitch.video == null || !pitch.video){
						thereIsANullPitch = true;
						return false; // There is one
					}
				});

				if(thereIsANullPitch){ // Uploaded already
					if(firstExecution){
						$('.btn-js-start-pitch').addClass('disabled');
						log('Continues with uploading ...');
						firstExecution = false;
					}
				} else {
					if(!firstExecution){
						$('.btn-js-start-pitch').removeClass('disabled')
						clearInterval(poolingInterval);
						log('End of Uploading');
					}
				}
			}
		});
	},3000);
}

