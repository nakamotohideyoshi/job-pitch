// Getting AWS credentials for uploading file to S3
var creds =AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:5e01a88d-f24a-45e8-b1f6-dc9e406fb042'
});
AWS.config.credentials = creds;
AWS.config.region = 'us-east-1';

var bucket = new AWS.S3({params: {Bucket: 'mjp-media-upload'}});

$(document).ready(function() {
	//
	$.get( "/api/job-seekers/", { csrftoken: getCookie('csrftoken') })
	.done(function( jobSeeker ) {
		if(jobSeeker[0].pitches[0] !== undefined){
				pitch = jobSeeker[0].pitches[0];

				if(pitch.video !== undefined){
					console.log(jobSeeker[0].pitches[0].video);
					$('#pitchVideoCheck').html('<video width="320" height="240" controls>'
						+	'<source src="'+pitch.video+'" type="video/mp4">'
						+'</video>');
				}
		}
	});

	var job_seeker_id = 0;
	$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') })
	.done(function( data ) {
		job_seeker_id = data.job_seeker;
	});


  $('.btn-js-start-pitch').click(function(e) {
  	onBtnRecordClicked();
  });
  $('.btn-js-stop-pitch').click(function(e) {
  	onBtnStopClicked();
  });
  $('.btn-js-upload-pitch').click(function(e) {
		//results.innerHTML = '';

		var videoDataContainer = document.getElementById('data');
		var params = {Key: 'pitch-'+job_seeker_id+'.webm', Body: videoDataContainer.value};
		bucket.upload(params, function (err, data) {
			console.log = err ? 'ERROR!' : 'SAVED.';
    });
  });
});

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