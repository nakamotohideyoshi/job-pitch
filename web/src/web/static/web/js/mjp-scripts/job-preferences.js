$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	var job_seeker = '';
	
	//Populate selects
	$.get( "/api/hours/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			$('#hours').append('<option value="'+obj.id+'">'+obj.name+'</options>');
		}
	})
	.fail(function( data ) {
		console.log( data );
		
	});
	
	$.get( "/api/contracts/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			$('#contract').append('<option value="'+obj.id+'">'+obj.name+'</options>');
		}
	})
	.fail(function( data ) {
		console.log( data );
		
	});
	
	$.get( "/api/sectors/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			console.log(obj);
			$('#sectors').append('<option value="'+obj.id+'">'+obj.name+'</options>');
		}
	})
	.fail(function( data ) {
		console.log( data );
		
	});
	
	$.get( "/api-rest-auth/user/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		job_seeker = data.job_seeker;
		$('#job_seeker').val(data.job_seeker);
	});
	
	$('#job-preferences').submit(function( event ) {
		event.preventDefault();
		var sectors = $('#sectors').val();
		var contract = $('#contract').val();
		var hours = $('#job_sector').val();
		var location = $('#location').val();
		var search_radius = $('#search_radius').val();
		
			postcodeLocationData(location, function(output){
  				var postcodeData = output.result;
				$('#latitude').val(postcodeData.latitude);
				$('#longitude').val(postcodeData.longitude);
				$('#place_name').val(postcodeData.nuts);
				$('#postcode_lookup').val(location);
				
				/*$.post( "/api/job-profiles/", { latitude: postcodeData.latitude, longitude: postcodeData.longitude, postcode_lookup: location, place_name: postcodeData.nuts, search_radius: search_radius,  job_seeker: job_seeker, csrftoken: getCookie('csrftoken'), contract:contract, hours:hours, sectors:sectors }).done(function( data ) {
					window.location.href = "/profile/pitch";			
			  	})
			  	.fail(function( data ) {
					console.log( data.responseJSON );
			  	});*/
				
				
				var formData = new FormData($('#job-preferences')[0]);
					  $.ajax({
						url: "/api/job-profiles/",
						type: 'POST',
						data: formData,
						async: false,
						cache: false,
						contentType: false,
						processData: false,
						success: function (data) {
						  		window.location.href = "/profile/pitch";
						}
					  });
				
				
			});
		
			
	});
	
});