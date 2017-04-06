$(function() {
	app(context).then(function() {
		$('#logged_in_menu').hide();
		deleteCookie('email');
		deleteCookie('key');

		$.post( "/api-rest-auth/logout/", context.csrfmiddlewaretoken)
		.done(function() {
			window.location.href = "/login";
		});
	});
});
