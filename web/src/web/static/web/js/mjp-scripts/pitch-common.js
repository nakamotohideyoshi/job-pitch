function checkIfThereIsApitch(argument) {
	log('info','Looking for a pitch...');

	var poolingPromise = new Promise(function(resolve,reject){
		poolingTranscodeProcess(resolve);
	})
	.then(function(pitches){
		var html = getHtmlForVideoOrThumbnail(pitches);

		$('#pitchVideoCheck').html(html);

		var videoLoading = document.getElementById('viewing-container');
		if(videoLoading != undefined && videoLoading.readyState !== 4) {// Video is not ready to play
			log('info', 'Loading...');

			var intervalVideoLoading = setInterval(function(argument) {
				if(videoLoading.readyState === 4){
					log('hide');
					clearInterval(intervalVideoLoading);
				};
			},2000);
		}
	});
}


function poolingTranscodeProcess(resolve){
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
						log('info', 'Transcoding a previous recorded video ...');
					}
				} else {
					if(!firstExecution){
						log('success', 'End of Uploading.');

						setTimeout(function(){
							location.reload();
						}, 1000);
					}

					$('.btn-js-start-pitch').attr('disabled', false);
					$('.btn-js-upload-pitch').attr('disabled', true);

					clearInterval(poolingInterval);
					resolve(pitches);
				}

				firstExecution = false;
			}
		});
	},3000);
}

