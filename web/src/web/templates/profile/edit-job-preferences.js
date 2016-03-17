$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	var job_seeker = '';
	var profile_id = '';
	
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
		$.get( "/api/job-seekers/"+job_seeker, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
			profile_id = data.profile;
			$.get( "/api/job-profiles/"+data.profile, { csrftoken: getCookie('csrftoken') }).done(function( data ) {
				console.log(data);
				$('#contract').val(data.contract);
				$('#hours').val(data.hours);
				$('#sector').val(data.sectors);
				$('#location').val(data.place_id);
				$('#search_radius').val(data.search_radius);
			});
		});
	});
	
	
	$('#job-preferences').submit(function( event ) {
		$('.btn-primary').attr( "disabled", true );
		event.preventDefault();
		var sectors = $('#sector').val();
		var contract = $('#contract').val();
		var hours = $('#job_sector').val();
		var location = $('#location').val();
		var search_radius = $('#search_radius').val();
		
			postcodeLocationData(location, function(output){
  				var postcodeData = output.result;
				
				
				
				
				$.put( "/api/job-profiles/"+profile_id, { latitude: postcodeData.latitude, longitude: postcodeData.longitude, place_id: location, place_name: postcodeData.nuts, search_radius: search_radius,  job_seeker: job_seeker, csrftoken: getCookie('csrftoken'), contract:contract, hours:hours, sectors:sectors }).done(function( data ) {
					formAlert('success', 'Successfully Updated!');			
			  	})
			  	.fail(function( data ) {
					console.log( data.responseJSON );
			  	});
				
			});
		
			
	});
	
});