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

	checkIfThereIsApitch();

	$('.btn-js-start-pitch').click(function(e) {
		// prepare video container;
		$('#pitchVideoCheck video').html('');

		if(onBtnRecordClicked()){
			startRecordingTimer(31, $('.btn-js-stop-pitch'), stopRecordingProcess);
		};
	});


	$('.btn-js-stop-pitch').click(function(e) {
		stopRecordingProcess( $(this) );
	});


	$('.btn-js-upload-pitch').click(function(e) {
		//var videoDataContainer = document.getElementById('data');
		//var params = {Key: 'pitch-'+job_seeker_id+'.webm', Body: videoDataContainer.value};
		//bucket.upload(params, function (err, data) {
		//	console.log = err ? 'ERROR!' : 'SAVED.';
		//});
		uploadBtn.disabled = true;
		videoElement.controls= false;

		if(rawMediaRecorded != undefined && rawMediaRecorded){
			getNewPitchMetaData(function(pitch){
				putIntoS3Bucket(pitch, rawMediaRecorded);
			});
		}
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

		var htmlVideo = '<video width="320" height="240" controls>'+videoSource+'</video><br>';
		$('#pitchVideoCheck').html(htmlVideo);
	}
}


function startRecordingTimer(duration, $display, callback) {
	var timer = duration, minutes, seconds;

	clearInterval(poolingInterval); // Clear any existent pooling process

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

	log('success', 'Video is ready for uploading.');
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
	log('info', 'Start uploading ...');

	object.Key = window.location.origin.replace('//','')
	+ '/' + pitch.token
	+ '.' + pitch.id
	+ '.' + object.Key;

	bucket.putObject(object, function (err, data) {
		if(!err){
			var poolingPromise = new Promise(function(resolve,reject){
				poolingTranscodeProcess(resolve);
			});
		}
		console.log(err ? 'ERROR!' : 'SAVED.');
	});
}
