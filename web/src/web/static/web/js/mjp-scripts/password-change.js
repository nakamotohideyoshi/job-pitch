$(function () {
	// Run login check funtion with auto-redirect
	checkLogin(true);

  // Populate any fields that have data
  $.get("/api-rest-auth/user/", {
    token: getCookie('key'),
    csrftoken: getCookie('csrftoken')
  }).done(function (data) {

    job_seeker_id = data.job_seeker;

    $.get("/api/job-seekers/" + data.job_seeker, {
      token: getCookie('key'),
      csrftoken: getCookie('csrftoken')
    }).done(function (data) {

      if (data.email != null) {
        $('#email').html(data.email);
      }

    });
  });


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
      var obj;
			var messageError = ''
      var field = '';

			for (var key in data.responseJSON) {
				obj = data.responseJSON[key][0];

        if(key=="new_password1"){
          obj = obj.replace('This', 'The new password');
        }else if(key=="new_password2"){
          obj = obj.replace('This', 'The confirm password');
        }

        formAlert('error', obj);
			}
		});
	});
});

