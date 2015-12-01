$(document).ready(function() {
			var job_seeker_id = 0;
			$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  
				  job_seeker_id = data.job_seeker;
			});
				$("#webcam").scriptcam({ 
					fileReady:fileReady,
					cornerRadius:20,
					cornerColor:'e3e5e2',
					onError:onError,
					promptWillShow:promptWillShow,
					showMicrophoneErrors:false,
					onWebcamReady:onWebcamReady,
					timeLeft:timeLeft,
					fileName:'mjp_web_record',
					path: '/static/web/js/ScriptCam/',
					connected:showRecord,
					width: 320,
					height: 240,
					maximumTime:30
				});
			});
			function showRecord() {
				$( "#recordStartButton" ).attr( "disabled", false );
			}
			function startRecording() {
				$( "#recordStartButton" ).hide();
				$( "#recordStopButton" ).attr( "disabled", false );
				$( "#recordStopButton" ).show();
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
				
				$.post( "/api/pitches/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
					console.log( data );
					$.put( "/api/pitches/"+data.id+"/?token="+data.token, { video: 'https://s3-eu-west-1.amazonaws.com/mjp-media-upload/'+filenameOnly , thumb: 'https://s3-eu-west-1.amazonaws.com/mjp-media-upload/'+filenameOnlyNoExt+'.jpg',csrftoken: getCookie('csrftoken') }).done(function( data ) {
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
			}