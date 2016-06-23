'use strict';

/* globals MediaRecorder */

// Spec is at http://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/RecordingProposal.html

//navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mediaDevices.getUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

/*
 * Here an adaptation to the new API, mediaDevices.getUserMedia(),
 * including a polyfill to cope with older browsers.
 *
 * See: https://developer.mozilla.org/es/docs/Web/API/MediaDevices/getUserMedia
 *
 */

var promisifiedOldGUM = function (constraints, successCallback, errorCallback) {

	// First get ahold of getUserMedia, if present
	var getUserMedia = (navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);

	// Some browsers just don't implement it - return a rejected promise with an error
	// to keep a consistent interface
	if (!getUserMedia) {
		return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
	}

	// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
	return new Promise(function (successCallback, errorCallback) {
		getUserMedia.call(navigator, constraints, successCallback, errorCallback);
	});

}

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
	navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
	navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
}

if (isBrowser("Chrome")) {
	var constraints = {
		"audio": true,
		"video": {
			"mandatory": {
				"minWidth": 320,
				"maxWidth": 320,
				"minHeight": 240,
				"maxHeight": 240
			},
			"optional": []
		}
	}; //Chrome
} else if (isBrowser("Firefox")) {
	var constraints = {
		"audio": true,
		"video": {
			"width": {
				"min": 320,
				"ideal": 320,
				"max": 1280
			},
			"height": {
				"min": 240,
				"ideal": 240,
				"max": 720
			}
		}
	}; //Firefox
}

var recBtn = document.querySelector('button.btn-js-start-pitch');
//var pauseResBtn = document.querySelector('button#pauseRes');
var stopBtn = document.querySelector('button.btn-js-stop-pitch');
var $uploadBtn = $('button.btn-js-upload-pitch');

var dataElement = jQuery('#data');
var downloadLink = document.querySelector('a#downloadLink');

var successGetUserMedia = true;
var rawMediaRecorded = false;

var videoElement;

function errorCallback(error) {
	recBtn.disabled = true;
	//	    pauseResBtn.disabled = false;
	stopBtn.disabled = true;
	$uploadBtn.attr('disabled', true);


	log('danger', error.message);

	console.log('navigator.getUserMedia error: ', error);

	successGetUserMedia = false;
}

/*
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var sourceBuffer;
*/

var localStream;
var mediaRecorder;
var chunks = [];
var count = 0;

function isMediaRecorderAPI() {
	return (typeof MediaRecorder !== 'undefined' || navigator.getUserMedia);
}

function getMediaRecorder(stream) {
	if (typeof MediaRecorder.isTypeSupported == 'function') {
		/*
			MediaRecorder.isTypeSupported is a Chrome 49 function announced in https://developers.google.com/web/updates/2016/01/mediarecorder but it's not present in the MediaRecorder API spec http://www.w3.org/TR/mediastream-recording/
		*/

		if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
			var options = {
				mimeType: 'video/webm;codecs=vp9'
			};
		} else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
			var options = {
				mimeType: 'video/webm;codecs=vp8'
			};
		}

		//log('info', 'Using ' + options.mimeType);

		return new MediaRecorder(stream, options);
	}

	//log('info', 'Using default codecs for browser');

	return new MediaRecorder(stream);
}


function beReadyForRecording(stream) {
	log('info', 'Be ready for recording...');

	mediaRecorder = getMediaRecorder(stream);

	mediaRecorder.start(10);

	var url = window.URL || window.webkitURL;
	videoElement.src = url ? url.createObjectURL(stream) : stream;
	videoElement.play();

	mediaRecorder.onstop = function () {
		// Clean recorded chunks
		chunks = [];
		// Stop active tracks
		//var tracks = mediaRecorder.stream.getTracks();
		//tracks.forEach(function (track) {
		//	track.stop();
		//});
	}
}


function startRecording(stream) {
	log('info', 'Start recording...');

	mediaRecorder = getMediaRecorder(stream);

	//pauseResBtn.textContent = "Pause";

	mediaRecorder.start(10);

	var url = window.URL || window.webkitURL;
	videoElement.src = url ? url.createObjectURL(stream) : stream;
	videoElement.play();

	mediaRecorder.ondataavailable = function (e) {
		chunks.push(e.data);
	};

	mediaRecorder.onerror = function (e) {
		log('error', 'Error: ' + e);
		console.log('Error: ', e);
	};

	mediaRecorder.onstart = function () {
		log('info', 'Recording ...');
	};

	mediaRecorder.onstop = function (e) {
		var contentType = "video/webm";

		log('info', 'Stopped.');

		var blob = new Blob(chunks, {
			type: contentType
		});
		chunks = [];

		var videoURL = window.URL.createObjectURL(blob);

		downloadLink.href = videoURL;
		videoElement.src = videoURL;
		downloadLink.innerHTML = 'Download video file';

		var date = new Date();
		var yyyy = date.getFullYear().toString();
		var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
		var dd = date.getDate().toString();
		var date = yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);

		var rand = Math.floor((Math.random() * 10000000));
		var name = "VID_" + date + '_' + rand + ".webm";

		rawMediaRecorded = {
			Key: name,
			Body: blob
		};

		downloadLink.setAttribute("download", name);
		downloadLink.setAttribute("name", name);

		if (!isBrowser('Firefox')) {
			var tracks = mediaRecorder.stream.getTracks();
			tracks.forEach(function (track) {
				track.stop();
			});
		}

	}

	mediaRecorder.onpause = function () {
		log('info', 'Paused & state = ' + mediaRecorder.state);
	}

	mediaRecorder.onresume = function () {
		log('info', 'Resumed  & state = ' + mediaRecorder.state);
	}

	mediaRecorder.onwarning = function (e) {
		log('warning', 'Warning: ' + e);
	};
}

//function handleSourceOpen(event) {
//  console.log('MediaSource opened');
//  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"');
//  console.log('Source buffer: ', sourceBuffer);
//}

function checkingForVideoContainer(resolve) {
	$('#pitchVideoCheck').html('<video id="recording-container" autoplay=""><video>');

	var intervalForChekingVideoContainer = setInterval(function () {
		var videoContainer = document.querySelector('video#recording-container');

		if (videoContainer) {
			clearInterval(intervalForChekingVideoContainer);
			resolve(videoContainer);
		}
	}, 1000);
}


function startBeReadyForRecording() {
	return new Promise(function (resolve, reject) {
			checkingForVideoContainer(resolve);
		})
		.then(function (videoContainer) {
			videoElement = videoContainer;
			videoElement.controls = false;

			navigator.mediaDevices.getUserMedia(constraints)
				.then(function (stream) {
					recBtn.disabled = true;
					//	    pauseResBtn.disabled = false;
					$uploadBtn.prop('disabled', true);

					beReadyForRecording(stream);
				});

			return videoContainer;
		});
}


function onBtnRecordClicked() {
	var success = true;

	return new Promise(function (resolve, reject) {
			checkingForVideoContainer(resolve);
		})
		.then(function (videoContainer) {
			videoElement = videoContainer;
			videoElement.controls = false;

			navigator.mediaDevices.getUserMedia(constraints)
				.then(function (stream) {
					stopBtn.disabled = false;
					startRecording(stream);
				});

			return videoContainer;
		});
}

function onBeReadyCountdown() {
	mediaRecorder.onstop();
}

function onBtnStopClicked() {
	mediaRecorder.onstop();

	videoElement.controls = true;
	recBtn.disabled = false;
	//	pauseResBtn.disabled = true;
	stopBtn.disabled = true;
	$uploadBtn.attr('disabled', false);
}

function onPauseResumeClicked() {

	if (pauseResBtn.textContent === "Pause") {

		console.log("pause");

		//		pauseResBtn.textContent = "Resume";
		mediaRecorder.pause();

		stopBtn.disabled = true;

	} else {
		console.log("resume");

		//		pauseResBtn.textContent = "Pause";
		mediaRecorder.resume();

		stopBtn.disabled = false;
	}

	recBtn.disabled = true;
	//pauseResBtn.disabled = false;

}

function closeMediaDevices() {
	var tracks = mediaRecorder.stream.getTracks();
	tracks.forEach(function (track) {
		track.stop();
	});
}