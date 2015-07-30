$(function() {
	//If logged in send them somewhere useful
	var login = checkLogin();
	if(login == true){
		window.location.href = "/";
	}
	//Form submit code
 	$('#login').submit(function( event ) {
		event.preventDefault();
		var username = $('#username').val();
		var password1 = $('#password').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();
			$.post( "/api-rest-auth/login/", { username: username, password: password1, csrfmiddlewaretoken: csrfmiddlewaretoken }).done(function( data ) {
				
				setCookie('username', username, 28);
				setCookie('key', data.key, 28);
				window.location.href = "/";
			  })
			  .fail(function( data ) {
				$('.alert-danger').show();
				$('.alert-danger').html('');
				for (var key in data.responseJSON) {
					var obj = data.responseJSON[key];
					$('.alert-danger').append(obj+'</br>');
				}
				console.log( data.responseJSON );
			  });
	});
});