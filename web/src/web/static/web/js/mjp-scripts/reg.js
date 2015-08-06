$(function() {
	//If logged in send them somewhere useful
	var login = checkLogin();
	if(login == true){
		window.location.href = "/";
	}
	//Form submit code
 	$('#register').submit(function( event ) {
		event.preventDefault();
		var username = $('#username').val();
		var password1 = $('#password1').val();
		var password2 = $('#password2').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();
		$.post( "/api-rest-auth/registration/", { username: username, password1: password1, password2: password2, csrfmiddlewaretoken: csrfmiddlewaretoken }).done(function( data ) {
			$.post( "/api-rest-auth/login/", { username: username, password: password1, csrfmiddlewaretoken: csrfmiddlewaretoken }).done(function( data ) {
				setCookie('username', username, 28);
				setCookie('key', data.key, 28);
				window.location.href = "/profile";
			  })
			  .fail(function( data ) {
				
			  });
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