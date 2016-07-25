$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

	//If logged in send them somewhere useful
	//Form submit code
	$('#password-reset-confirm').submit(function (event) {
		event.preventDefault();
		var email = getCookie('email');
		var old_password = $('#old_password').val();
		var new_password1 = $('#new_password1').val();
		var new_password2 = $('#new_password2').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();

		$.post("/api-rest-auth/password/change/", {
			email: email,
			old_password: old_password,
			new_password1: new_password1,
			new_password2: new_password2,
			csrfmiddlewaretoken: csrfmiddlewaretoken
		}).done(function (data) {

			$.post("/api-rest-auth/login/", {
				email: email,
				password: new_password1,
				csrfmiddlewaretoken: csrfmiddlewaretoken
			}).done(function (data) {
				setCookie('key', data.key, 28);

				window.location.href = "/password-change/done/";
			});

		}).fail(function (data) {
			var messageError = ''
			for (var key in data.responseJSON) {
				var obj = data.responseJSON[key];
				messageError = messageError + obj + '<br>';
			}
			formAlert('danger', messageError);
		});
	});
});

