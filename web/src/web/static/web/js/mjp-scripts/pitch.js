$(document).ready(function() {
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
				$( "#recordStartButton" ).attr( "disabled", true );
				$( "#recordStopButton" ).attr( "disabled", false );
				$.scriptcam.startRecording();
			}
			function closeCamera() {
				$("#recordStopButton" ).attr( "disabled", true );
				$.scriptcam.closeCamera();
				$('#message').html('Please wait for the file conversion to finish...');
			}
			function fileReady(fileName) {
				$('#recorder').hide();
				$('#message').html('This file is now dowloadable for five minutes over <a href='+fileName+'>here</a>.');
				var fileNameNoExtension=fileName.replace(".mp4", "");
				
				$('#mediaplayer').show();

					   $.ajax({
						  method: "GET",
						  url: "http://52.10.72.16/videoProcess.php",
						  data: {file:fileName}
						})
						  .done(function( msg ) {
							alert( "Data Saved: " + msg );
						  });
			}
			function onError(errorId,errorMsg) {
				alert('hit');
				alert(errorMsg);
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
			$('#pitch-upload').submit(function( event ) {
				event.preventDefault();
				var fd = new FormData(document.getElementById("file-upload"));
				console.log(fd);
				$.ajax({
				  url: "http://52.10.72.16/upload_fallback.php",
				  type: "POST",
				  data: fd,
				  enctype: 'multipart/form-data',
				  processData: false,  // tell jQuery not to process the data
				  contentType: false   // tell jQuery not to set contentType
				}).done(function( data ) {
					console.log("PHP Output:");
					console.log( data );
				});
			});