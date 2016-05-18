// Getting AWS credentials for uploading file to S3
var creds =AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	IdentityPoolId: 'us-east-1:5e01a88d-f24a-45e8-b1f6-dc9e406fb042'
});
AWS.config.credentials = creds;
AWS.config.region = 'us-east-1';

var bucket = new AWS.S3({params: {Bucket: 'mjp-android-uploads'}});

var videoTimer;

var actualPitch = null;

$(document).ready(function() {
	//
	var job_seeker_id = 0;
	$.get( "/api/job-seekers/", { csrftoken: getCookie('csrftoken') })
	.done(function( jobSeeker ) {
		job_seeker_id = jobSeeker[0].id;

		if(jobSeeker[0].pitches[0] !== undefined){
			actualPitch = jobSeeker[0].pitches[0];
			renderVideoContainer(actualPitch);
			//poolingS3upload(actualPitch);
		}
	});

/*
	$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') })
	.done(function( data ) {
		job_seeker_id = data.job_seeker;
	});

*/

	$('.btn-js-start-pitch').click(function(e) {
		// prepare video container;
		$('#pitchVideoCheck video').html('');

		if(onBtnRecordClicked()){
			startVideoTimer(19, $('.btn-js-stop-pitch'), stopRecordingProcess);
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
	var videoSource = '';

	if(pitch !== null && pitch !== undefined && pitch.video !== undefined && pitch.video !== null){
		var videoType = 'video/webm';

		if(pitch.video.indexOf('mp4')>=0){
			videoType = 'video/mp4';
		}
		videoSource = '<source src="'+pitch.video+'" type="'+videoType+'">';

		var htmlVideo = '<video width="320" height="240" controls autoplay>'+videoSource+'</video><br>';

		$('#pitchVideoCheck').html(htmlVideo);
	}
}

function startVideoTimer(duration, $display, callback) {
	var timer = duration, minutes, seconds;

	videoTimer = setInterval(function () {
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

		clearInterval(videoTimer);

		onBtnStopClicked();

		if(rawMediaRecorded != undefined && rawMediaRecorded){
			getNewPitchMetaData(function(pitch){
				saveS3object(pitch, rawMediaRecorded);
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

function saveS3object(pitch, object){
	log('Start uploading ...');

	object.Key = window.location.origin.replace('//','')
	+ '/' + pitch.token
	+ '.' + pitch.id
	+ '.' + object.Key;

	bucket.putObject(object, function (err, data) {
		if(!err){
			poolingS3upload(pitch);
		}
		console.log(err ? 'ERROR!' : 'SAVED.');
	});
}

function poolingS3upload(pitch){
	log('Continues with transcoding ...');

	$('.btn-js-start-pitch').addClass('disabled');

	uploadingS3timer = setInterval(function(){
		$.ajax({
			url: "/api/pitches/",
			type: 'GET',
			data: {
			    "id": pitch.id,
			    "token": pitch.token,
			    "video": null,
			    "thumbnail": null,
			    "job_seeker": job_seeker_id
			},
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

				if(!thereIsANullPitch){
					$('.btn-js-start-pitch').removeClass('disabled')
					clearInterval(uploadingS3timer);
					log('End of Uploading');
				} else {

				}
			}
		});
	},3000);
}

/* function showRecord() {
	$( "#recordStartButton" ).attr( "disabled", false );
}
function startRecording() {
	$( "#recordStartButton" ).hide();
	$( "#recordStopButton" ).attr( "disabled", false );
	$( "#recordStopButton" ).css('display', 'block');
	$.scriptcam.startRecording();
}
function closeCamera() {
	$("#recordStopButton" ).attr( "disabled", true );
	$.scriptcam.closeCamera();
	$('#message').html('Please wait while we process your upload.');
}
function fileReady(fileName) {
	$('#recorder').hide();
	var filenameOnly = fileName.replace("http://europe.www.scriptcam.com/dwnld/", "");
	var filenameOnlyNoExt = filenameOnly.replace(".mp4", "");
	console.log(filenameOnly);

	$('#message').html('Pitch Uploaded: '+filenameOnly);

	$('#mediaplayer').show();

	$.ajax({
		url: "/api/pitches/",
		type: 'POST',
		data: 'csrftoken='+getCookie('csrftoken'),
		async: false,
		cache: false
	}).done(function( data ){
		//$.post( "/api/pitches/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		console.log( data );

		//	video: 'https://s3-eu-west-1.amazonaws.com/mjp-media-upload/'+filenameOnly,
		$.put( "/api/pitches/"+data.id+"/?token="+data.token, {
			video: fileName,
			thumb: 'https://s3-eu-west-1.amazonaws.com/mjp-media-upload/'+filenameOnlyNoExt+'.jpg',
			csrftoken: getCookie('csrftoken')
		}).done(function( data ) {
			window.location.href = "/profile/viewpitch";
		})
		.fail(function( data ) {
			alert( data.responseJSON );
		});
	})
	.fail(function( data ) {
		alert( data.responseJSON );
	});

}
function onError(errorId,errorMsg) {
	console.log(errorMsg);
}
function onWebcamReady(cameraNames,camera,microphoneNames,microphone,volume) {
	$.each(cameraNames, function(index, text) {
		$('#cameraNames').append( $('<option></option>').val(index).html(text) )
	});
	$('#cameraNames').val(camera);
	$.each(microphoneNames, function(index, text) {
		$('#microphoneNames').append( $('<option></option>').val(index).html(text) )
	});
	$('#microphoneNames').val(microphone);
}
function promptWillShow() {
	alert('A security dialog will be shown. Please click on ALLOW.');
}
function timeLeft(value) {
	$('.timeLeft').html(value);
}
function changeCamera() {
	$.scriptcam.changeCamera($('#cameraNames').val());
}
function changeMicrophone() {
	$.scriptcam.changeMicrophone($('#microphoneNames').val());
}*/
function newPitchStart(){
	$('.videoCheckEdit').hide();
	$('.recordNewVideo').show();
}