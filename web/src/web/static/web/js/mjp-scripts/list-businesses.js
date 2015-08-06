function goToLocation(id){
        window.location.href = "/profile/list-locations/?id="+id;
    }
$(function() {
	// Run login check funtion with auto-redirect
	checkLogin(true);
	// Populate any fields that have data
			  $.get( "/api/businesses/", { csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  for (var key in data) {
					  var obj = data[key];
					  var imageThumb = '';
					  if(obj.images.length != 0){
						  imageThumb = obj.images[0].thumbnail;
					  }
					  if(imageThumb != ''){
					  	$('#list-table tbody').append('<tr onclick="goToLocation('+obj.id+');" data-business-id="'+obj.id+'" class="business-list" id="business-list-'+obj.id+'"><td class="text-center"><img width="150px" src="'+imageThumb+'"></td><td>'+obj.name+'</td><td>'+obj.locations.length+'</td></tr>');
					  }else{
						 $('#list-table tbody').append('<tr onclick="goToLocation('+obj.id+');" data-business-id="'+obj.id+'" class="business-list" id="business-list-'+obj.id+'"><td class="text-center"><img width="150px" src="/static/web/images/no_image_available.png"></td><td>'+obj.name+'</td><td>'+obj.locations.length+'</td></tr>');
					  }
				  }
			  })
			  .fail(function( data ) {
				console.log( data );
			  });
	
	
 	
});