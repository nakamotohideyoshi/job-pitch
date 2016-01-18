$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	
	$('#work_place_details').show();
	//grab business id from url
	var business_id = QueryString.id;
	
	$('#business').val(business_id);
	$('#work_place_details').show();
	
	
	$('#work_place_details').submit(function( event ) {
		event.preventDefault();
			
			var work_place_name = $('#work_place_name').val();		
			var work_place_description = $('#work_place_description').val();
			var work_place_address = $('#work_place_address').val();	
			if ($('#work_place_address_public').is(':checked')) {
				var work_place_address_public = true;
			}else{
				var work_place_address_public = false;
			}
			var work_place_email = $('#work_place_email').val();
			if ($('#work_place_email_public').is(':checked')) {
				var work_place_email_public = true;
			}else{
				var work_place_email_public = false;
			}
			var work_place_telephone = $('#work_place_telephone').val();
			if ($('#work_place_telephone_public').is(':checked')) {
				var work_place_telephone_public = true;
			}else{
				var work_place_telephone_public = false;
			}
			var work_place_mobile = $('#work_place_mobile').val();
			if ($('#work_place_mobile_public').is(':checked')) {
				var work_place_mobile_public = true;
			}else{
				var work_place_mobile_public = false;
			}
			var work_place_location = $('#work_place_location').val();
			var business_id = $('#business').val();
			
			postcodeLocationData(work_place_location, function(output){
  				var postcodeData = output.result;
			
				$.post( "/api/user-locations/", { name:work_place_name, description:work_place_description, address:work_place_address, email:work_place_email, email_public:work_place_email_public, telephone:work_place_telephone, telephone_public:work_place_telephone_public, mobile:work_place_mobile, mobile_public:work_place_mobile_public, business:business_id, latitude: postcodeData.latitude, longitude: postcodeData.longitude, place_name:postcodeData.nuts }).done(function( data ) {
						  $('#location').val(data.id);
						  if($('#work_place_image').val() != ''){
							  var formData2 = new FormData($('#work_place_details')[0]);
							  $.ajax({
								url: '/api/user-location-images/',
								type: 'POST',
								data: formData2,
								async: false,
								cache: false,
								contentType: false,
								processData: false,
								success: function (data) {
										console.log(data);
										window.location.href = "/profile/list-locations/?id="+business_id;
								}
							  });
						  }else{
								window.location.href = "/profile/list-locations/?id="+business_id;  
						  }
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
	});
});