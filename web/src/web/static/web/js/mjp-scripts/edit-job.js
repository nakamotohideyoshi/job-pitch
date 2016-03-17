$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	$("#status_job").bootstrapSwitch();
	
	//grab job_id id from url
	var job_id = QueryString.id;
	
	//variables defined
	var open_job_status;
	var closed_job_status;
	var location_id;
	
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
	
	//Get other data
	
	$.get( "/api/job-statuses/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
		for (var key in data) {
			var obj = data[key];
			if(obj.name == "OPEN"){
				open_job_status = obj.id;
			}else if(obj.name == "CLOSED"){
				closed_job_status = obj.id;
			}
		}
	})
	.fail(function( data ) {
		console.log( data );
	});
	
	
	// Populate any fields that have data
				  
				  $.get( "/api/user-jobs/"+job_id, { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
					  
					  console.log( data );
				  if(data.status == closed_job_status){
				    $('#status_job').bootstrapSwitch('toggleState');
				  }
				  
				  if(data.title != null){
				  	$('#title').val(data.title);
				  }
				  if(data.description != null){
				  	$('#description').val(data.description);
				  }
				  if(data.sector != null){
				  	$('#job_sector').val(data.sector);
				  }
				  if(data.contract != null){
				  	$('#contract').val(data.contract);
				  }
				  if(data.hours != null){
				  	$('#hours').val(data.hours);
				  }
				  location_id = data.location;
				 
				  })
				  .fail(function( data ) {
					console.log( data );
				  });
	
			  
	//Form submit code
 	$('#create-job').submit(function( event ) {
		$('.btn-primary').attr( "disabled", true );
		event.preventDefault();
		var title = $('#title').val();
		var description = $('#description').val();
		var job_sector = $('#job_sector').val();
		var contract = $('#contract').val();
		var hours = $('#hours').val();
		if ($('#status_job').is(':checked')) {
			var status_job = open_job_status;
		}else{
			var status_job = closed_job_status;
		}
			$.put( "/api/user-jobs/"+job_id, { title: title, description: description, sector: job_sector, contract: contract, hours: hours, location:location_id, status:status_job, csrftoken: getCookie('csrftoken') }).done(function( data ) {
				$('#job_id').val(data.id);
								formAlert('success', 'Successfully Updated! <br><a href="/profile/list-jobs/?id='+location_id+'">Back to Job List</a>');
								//window.location.href = "/profile/list-jobs/?id="+location_id;
								setTimeout(function () {
									$('.btn-primary').attr( "disabled", false );
									$('.alert').hide();
								}, 5000);
				
			  })
			  .fail(function( data ) {
				var messageError = ''
				for (var key in data.responseJSON) {
					var obj = data.responseJSON[key];
					messageError = messageError+obj+'<br>';
				}
				formAlert('danger', messageError);
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