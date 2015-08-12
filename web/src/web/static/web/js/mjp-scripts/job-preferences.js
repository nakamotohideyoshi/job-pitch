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
			$('#sector').append('<option value="'+obj.id+'">'+obj.name+'</options>');
		}
	})
	.fail(function( data ) {
		console.log( data );
		
	});
	
	$.get( "/api-rest-auth/user/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		job_seeker = data.job_seeker;
	});
	
	$('#job-preferences').submit(function( event ) {
		event.preventDefault();
		var sectors = $('#sector').val();
		var contract = $('#contract').val();
		var hours = $('#job_sector').val();
		var location = $('#location').val();
		var search_radius = $('#search_radius').val();
		
			postcodeLocationData(location, function(output){
  				var postcodeData = output.result;
				
				console.log(postcodeData.latitude);
				
				
				$.post( "/api/job-profiles/", { latitude: postcodeData.latitude, longitude: postcodeData.longitude, place_id: '', place_name: postcodeData.nuts, search_radius: search_radius,  job_seeker: job_seeker, csrftoken: getCookie('csrftoken'), contract:contract, hours:hours, sectors:sectors }).done(function( data ) {
					window.location.href = "/profile/pitch";			
			  	})
			  	.fail(function( data ) {
					console.log( data.responseJSON );
			  	});
				
			});
		
			
	});
	
});