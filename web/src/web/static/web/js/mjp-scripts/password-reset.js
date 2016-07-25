$(function () {
	//If logged in send them somewhere useful
	//Form submit code
	$('#password-reset').submit(function (event) {
		event.preventDefault();
		var email = $('#email').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();

		$.post("/api-rest-auth/password/reset/", {
			email: email,
			csrfmiddlewaretoken: csrfmiddlewaretoken
		}).done(function (data) {

			window.location.href = "/password-reset/done/";

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

