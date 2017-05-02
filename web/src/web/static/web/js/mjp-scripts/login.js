$(function() {
	context.redirectIfNotLoggedIn = false;

	app(context).then(function() {
		//If logged in send them somewhere useful
		var goToUrl = QueryString.url;
		if(context.userIsLoggedIn){
			window.location.href = goToUrl ? goToUrl : '/';
		}

		//Form submit code
	 	$('.login.page form').submit(function( event ) {
			event.preventDefault();
			var email = $('#email').val();
			var password1 = $('#password').val();
			var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();

			ApiRestAuth.login.post({
				email: email,
				password: password1,
				csrfmiddlewaretoken: csrfmiddlewaretoken
			}).then(function(data) {
				setCookie('email', email, 28);
				setCookie('key', data.key, 28);
				//window.location.href = "/applications/";

				if(goToUrl){
					window.location.href = goToUrl;

				} else {
					context.toUserHomePageFromRoot();
				}
			});
		});
	});
});
