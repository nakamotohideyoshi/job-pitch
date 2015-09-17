$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	//grab location id from url
	var location_id = QueryString.id;
	
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
			$('#job_sector').append('<option value="'+obj.id+'">'+obj.name+'</options>');
		}
	})
	.fail(function( data ) {
		console.log( data );
	});
			  
	//Form submit code
 	$('#create-job').submit(function( event ) {
		event.preventDefault();
		var title = $('#title').val();
		var description = $('#description').val();
		var job_sector = $('#job_sector').val();
		var contract = $('#contract').val();
		var hours = $('#hours').val();
		
			$.post( "/api/user-jobs/", { title: title, description: description, sector: job_sector, contract: contract, hours: hours, location:location_id, status:1, csrftoken: getCookie('csrftoken') }).done(function( data ) {
				$('#job_id').val(data.id);
				var formData = new FormData($('#create-job')[0]);
					  $.ajax({
						url: '/api/user-job-images/',
						type: 'POST',
						data: formData,
						async: false,
						cache: false,
						contentType: false,
						processData: false,
						success: function (data) {
								window.location.href = "/profile/list-jobs/?id="+location_id;
						}
					  });
				
			  })
			  .fail(function( data ) {
				console.log( data.responseJSON );
			  });
	});
	
	var text_max = 500;
    $('#textarea_feedback').html(text_max + ' characters remaining');

    $('#description').keyup(function() {
        var text_length = $('#description').val().length;
        var text_remaining = text_max - text_length;

        $('#textarea_feedback').html(text_remaining + ' characters remaining');
    });
});