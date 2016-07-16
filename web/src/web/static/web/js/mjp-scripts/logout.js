$(function() {
	//If logged in log them out, if not logged in, send them away
	var login = checkLogin();
	$('#logged_in_menu').hide();
	if(login == true){
			deleteCookie('email');
			deleteCookie('key');
			
			$.post( "/api-rest-auth/logout/", { csrfmiddlewaretoken: getCookie('csrftoken') }).done(function( data ) {
				
			  })
			  .fail(function( data ) {
				console.log( data.responseJSON );
			  });
	}else{
		window.location.href = "/login";
	}
});