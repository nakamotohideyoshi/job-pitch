function videoIsReadyForPlay(video) {
	return (video != undefined) && (
		video.readyState === 4 || (isBrowser('Firefox') && video.readyState === 3)
	);
}

function checkIfThereIsApitch(argument) {
	log('info', 'Looking for a pitch...');

	var poolingPromise = new Promise(function (resolve, reject) {
			poolingTranscodeProcess(resolve);
		})
		.then(function (pitches) {
			var html = getHtmlForVideoOrThumbnail(pitches);

			$('#pitchVideoCheck').html(html);

			if (pitches == undefined || pitches.length == 0) {
				log('danger', 'There is not a pitch.');
				return;
			}

			var videoLoading = document.getElementById('viewing-container');
			if (!videoIsReadyForPlay(videoLoading)) {
				log('info', 'Loading...');

				var intervalVideoLoading = setInterval(function (argument) {
					if (videoIsReadyForPlay(videoLoading)) {
						log('hide');
						clearInterval(intervalVideoLoading);
					}
				}, 2000);
			}
		});
}


function poolingTranscodeProcess(resolve) {
	var firstExecution = true;

	poolingInterval = setInterval(function () {
		$.ajax({
			url: "/api/pitches/",
			type: 'GET',
			cache: false
		}).done(function (pitches) {
			if (pitches == undefined || pitches.length == 0) {
				resolve([]); // There is not pitches
			}

			var thereIsANullPitch = false;

			pitches.forEach(function (pitch) {
				if (pitch.video == undefined || pitch.video == null || !pitch.video) {
					thereIsANullPitch = true;
					return false; // There is one
				}
			});

			if (thereIsANullPitch) { // Uploaded already
				if (firstExecution) {
					log('info', 'Processing upload, please wait...');
				}
			} else {
				if (!firstExecution) {
					log('success', 'End of Uploading.');

					setTimeout(function () {
						location.reload();
					}, 1000);
				}

				$('.btn-js-start-pitch').attr('disabled', false);
				$('.btn-js-upload-pitch').attr('disabled', true);

				clearInterval(poolingInterval);
				resolve(pitches);
			}

			firstExecution = false;
		});
	}, 3000);
}


function checkPitchesIfExists(type, pitches) {
	var i;
	var found = false;

	pitches.forEach(function (pitch, index) {
		i = index;

		if (_.hasIn(pitch, type)) {
			if (type == 'video') {
				if (!_.isEmpty(pitch.video)) {
					found = true;
					return false; // out of $.each
				}
			} else if (type == 'thumbnail') {
				if (!_.isEmpty(pitch.thumbnail)) {
					found = true;
					return false; // out of $.each
				}
			}
		}
	});

	if (found) {
		return i;
	}

	return false;
}