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
					  	$('#list-table tbody').append('<tr data-business-id="'+obj.id+'" class="business-list" id="business-list-'+obj.id+'"><td onclick="goToLocation('+obj.id+');" class="text-center"><img width="150px" src="'+imageThumb+'"></td><td onclick="goToLocation('+obj.id+');">'+obj.name+'</td><td onclick="goToLocation('+obj.id+');">'+obj.locations.length+'</td><td><a href="javascript:deleteRow('+obj.id+',\'user-businesses\' , \'business-list-\');" data-apiFunction="user-businesses" data-rowPrefix="business-list-" data-id="'+obj.id+'" class="btn btn-danger btn-delete btn-on-table"><i class="fa fa-trash"></i></a></td></tr>');
					  }else{
						 $('#list-table tbody').append('<tr class="business-list" id="business-list-'+obj.id+'"><td class="text-center" onclick="goToLocation('+obj.id+');"><img width="150px" src="/static/web/images/no_image_available.png"></td><td onclick="goToLocation('+obj.id+');">'+obj.name+'</td><td onclick="goToLocation('+obj.id+');">'+obj.locations.length+'</td><td><a href="javascript:deleteRow('+obj.id+',\'user-businesses\' , \'business-list-\');" class="btn btn-danger btn-delete btn-on-table"><i class="fa fa-trash"></i></a></td></tr>');
					  }
				  }
			  })
			  .fail(function( data ) {
				console.log( data );
			  });
	
	
 	
});