/* Common Functions */
function goToTop() {
	// This for hacking scrolltop because it does not work
	// when body and html has 100% heigth.
	document.location.hash = "#wrapper";
	document.location.hash = "#hacked-top";
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/;";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');

	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}

	return "";
}

function deleteCookie(cname) {
	document.cookie = cname + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

//get lat long and other data from postcode
function postcodeLocationData(postcode, handleData) {
	if (postcode != '') {
		$.ajax({
			cache: false,
			url: "https://api.postcodes.io/postcodes/" + postcode,
			success: function(data) {
				handleData(data);
			},
			error: function(data) {
				console.log(data.responseJSON.error);
				//fieldError('Please enter a valid postcode.', 'postcode');
				formAlert('danger', 'Please enter a valid postcode.');
				goToTop();
			}
		});

		return;
	}

	fieldError('Please enter a postcode.', 'postcode');
	$('.btn-primary').attr("disabled", false);
}

//if redirect is true, send user to login
function checkLogin(redirect) {
	//Check if this is a mobile device, if so tell them to go use the mobile apps
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		window.location.href = "/mobile-app";
	}

	var email = getCookie('email');
	if (email == "") {
		if (redirect == true) {
			window.location.href = "/login";
		} else {
			//show login & reg links
			$('.not_logged_in_menu').show();
			$('.not_logged_in_element').show();
			$('.login-email').hide();

			return false;
		}
	} else {
		setHeaderEmail();

		return true;
	}
}

function logoutUser() {
	deleteCookie('email');
	deleteCookie('key');

	$.post("/api-rest-auth/logout/", {
			csrfmiddlewaretoken: getCookie('csrftoken')
		})
		.done(function(data) {
			window.location.href = "/";
		})
		.fail(function(data) {
			window.location.href = "/";

		});

}

function setHeaderEmail() {
	var email = getCookie('email');
	$('#header_email').html(email);

	// Display said menu
	$('.logged_in_menu').show();
}

function applyForJob(job_id, job_seeker_id) {
	$.post("/api/applications/", {
		job: job_id,
		job_seeker: job_seeker_id,
		csrftoken: getCookie('csrftoken')
	}).done(function(data) {
		$('#applyButton').fadeOut(200, function() {
			$('#job_applied_for').show();
			goToTop();
		});
	});
}

function connectWithJob(job_id, job_seeker_id) {
	$.post("/api/applications/", {
		job: job_id,
		job_seeker: job_seeker_id,
		csrftoken: getCookie('csrftoken')
	}).done(function(data) {
		log('info', 'Thanks for requesting to connect. A message has been sent to the job seeker.');
		log('info', 'You have spent 1 token!');
		/*
		$('#viewPitchModal')
			.find('.modal-body')
			.html('<div class="row"><div class="col-md-12"><h4 style="text-align: center; font-size:16px;">Thanks for requesting to connect. A message has been sent to the job seeker</h4></div></div><div class="row"><div class="col-md-12" style="text-align:center;"><button style="margin-left:0;" type="button" class="btn btn-custom" data-dismiss="modal" aria-label="Close">Back to List</button></div></row>');
		*/
		$('#job-list-' + job_seeker_id).remove();
	}).fail(function(data) {
		if (data.responseText.indexOf('must make a unique set') > 0) {
			log('info', 'The job seeker has already received a message with your requested connection.');
		}
	});
}

function setShortListedApplication(application_id) {
	$.put("/api/applications/" + application_id + "/", {
		shortlisted: true,
		csrftoken: getCookie('csrftoken')
	}).done(function(data) {
		log('info', 'This application was set as short listed already.');
	});
}

function messageRead(message_id) {
	$.put("/api/messages/" + message_id + '/', {
		read: true,
		csrftoken: getCookie('csrftoken')
	});
}

var QueryString = function() {
	// This function is anonymous, is executed immediately and
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);

			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;

			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}();

// Get the user type(business or job_seeker) & sort the menus out.
function userTypeMenuConfiguration(redirectToProfile) {
	$.get("/api-rest-auth/user/", {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')

	}).done(function(user) {
		if (user.businesses.length) {
			// business
			$('.business-link').show();
			$('.job-seeker-link').remove();
		} else if (user.job_seeker != null) {
			// job-seeker
			$('.business-link').remove();
			$('.job-seeker-link').show();
		} else {
			// Go Finish registration
			if (redirectToProfile == true) {
				window.location.href = "/profile/";
			} else {
				var pathArray = window.location.pathname.split('/');
				var isNewUser = pathArray[1].toLowerCase() == "profile" && pathArray[3].toLowerCase() == "create";

				if (isNewUser) {
					if (user.can_create_bussiness) {
						window.location.href = "/profile/recruiter/create/";
					} else {
						window.location.href = "/profile/job-seeker/create/";
					}
				}
			}
		}

	}).fail(function(user) {
		logoutUser();
		console.log(user);
	});

}

/*function formAlert(type, message) {
	return new Promise(function(resolve, reject) {
		$('.alert').addClass('alert-' + type);
		$('.alert').html(message);
		$('.alert').show();

		setTimeout(function () {
			$('.alert').hide();

		}, 5000);

		resolve();
	});

}*/

function formAlert(type, message) {
	return new Promise(function(resolve, reject) {
		resolve(log(type, message));
	});
}

function putManyAlerts(parentId, messages) {
	$(parentId + ' > .alert').addClass('alert-' + messages[0].type);
	$(parentId + ' > .alert').html(messages[0].content);
	$(parentId + ' > .alert').show();

	for (var i = 1; i < messages.length; i++) {
		message = messages[i];

		$(parentId + ' > .alert:last')
			.clone()
			.addClass('alert-' + message.type)
			.html(message.content)
			.insertAfter(parentId + ' > .alert:last');
	}
}

function showAlert(selector, type, text) {
	var icon = 'glyphicon-ok';

	if (type == 'danger') {
		icon = 'glyphicon-exclamation-sign';
	}

	$(selector)
		.html('<div class="alert alert-' + type + '" role="alert">' + '<span class="glyphicon ' + icon + '" aria-hidden="true">&nbsp;</span>' + text + '</div>')
		.find('.alert').show().fadeOut(10000);
}

function fieldError(error, field) {
	$('.formFieldError').remove();
	$('.formFieldErrorInField').removeClass('formFieldErrorInField');
	$('*[data-error-field="' + field + '"]').parent("div").append('<p class="formFieldError bg-danger">' + error + '</p>');
	$('*[data-error-field="' + field + '"]').addClass('formFieldErrorInField');
}

function clearErrors() {
	$('.formFieldError').remove();
	$('.formFieldErrorInField').removeClass('formFieldErrorInField');
}

function deleteRow(id, apiFunction, rowPrefix) {

	bootbox.confirm("Are you sure?", function(isOk) {
		if (isOk) {
			$.ajax({
				url: "/api/" + apiFunction + "/" + id + "/",
				type: 'DELETE',
				data: {
					csrftoken: getCookie('csrftoken')
				},
				success: function(result) {
					console.log(rowPrefix + id);
					$('#' + rowPrefix + id).fadeOut(250);
				}
			});
		}
	});
}

function deleteRowApplication(id, rowPrefix) {
	bootbox.confirm("Are you sure?", function(result) {
		$.ajax({
			url: "/api/applications/" + id + "/",
			type: 'PUT',
			data: {
				csrftoken: getCookie('csrftoken'),
				status: 3
			},
			success: function(result) {
				console.log(rowPrefix + id);
				$('#' + rowPrefix + id).fadeOut(250);
			}
		});
	});
}

//check if a job seeker account is active. Returns true|false

function account_active_check() {
	$.get("/api-rest-auth/user/", {
		token: getCookie('key'),
		csrftoken: getCookie('csrftoken')
	}).done(function(data) {
		job_seeker_id = data.job_seeker;

		$.get("/api/job-seekers/" + data.job_seeker, {
			token: getCookie('key'),
			csrftoken: getCookie('csrftoken')
		}).done(function(data) {
			return data.active;
		});

	});
}

// Some handy helpers

$.put = function(url, data, callback, type) {

	if ($.isFunction(data)) {
		type = type || callback,
			callback = data,
			data = {}
	}

	return $.ajax({
		url: url,
		type: 'PUT',
		success: callback,
		data: data,
		contentType: type
	});
}

$.delete = function(url, data, callback, type) {

	if ($.isFunction(data)) {
		type = type || callback,
			callback = data,
			data = {}
	}

	return $.ajax({
		url: url,
		type: 'DELETE',
		success: callback,
		data: data,
		contentType: type
	});
}

//Fix the CSRF on the above functions

function csrfSafeMethod(method) {
	// these HTTP methods do not require CSRF protection
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
	beforeSend: function(xhr, settings) {
		if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
			xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		}
	}
});

function deleteJobSeekerFromJob(job_id, job_seeker) {

}

function viewPitch(url, job_id, job_seeker, application_id) {
	$('#pitchViewer').html('');
	$('#pitchViewer').html('<video width="320" height="240" controls><source src="' + url + '" type="video/mp4"></video>');
	$('#applyButtonModal').attr('href', 'javascript:connectWithJob(' + job_id + ',' + job_seeker + ');');
	$('#shortListButtonModal').attr('href', 'javascript:setShortListedApplication(' + application_id + ');');
	$('#deleteButtonModal').attr('href', 'javascript:deleteJobSeekerFromJob(' + job_id + ',' + job_seeker + ');');
	$('#applyButtonModal').show();
	$('#deleteButtonModal').show();
	$('#shortListButtonModal').show();
	$('#viewPitchModal').modal('show');
}

function viewPitch2(url, job_id, job_seeker, application_id) {
	$('#pitchViewer').html('');
	$('#pitchViewer').html('<video width="320" height="240" controls><source src="' + url + '" type="video/mp4"></video>');
	$('#applyButtonModal').attr('href', 'javascript:connectWithJob(' + job_id + ',' + job_seeker + ');');
	$('#shortListButtonModal').attr('href', 'javascript:setShortListedApplication(' + application_id + ');');
	$('#applyButtonModal').show();
	$('#shortListButtonModal').show();
	$('#viewPitchModal').modal('show');
}

function getHtmlForVideoOrThumbnail(pitches) {
	var link = '';

	var content = '<img src="/static/web/images/no_image_available.png" styles="width:160px;">';

	$.each(pitches, function(index, pitch) {
		if (_.hasIn(pitch, 'video') && !_.isEmpty(pitch.video)) {
			link = pitch.video;
			content = '<video id="viewing-container" width="320" height="240" controls><source src="<%= url %>" type="video/mp4"></video>';
			return false; // out of  $.each
		}

		if (_.hasIn(pitch, 'thumbnail') && !_.isEmpty(pitch.thumbnail)) {
			link = pitch.thumbnail;
			content = '<img src="<%= url %>">';
			return false; // out of  $.each
		}
	});

	var template = _.template(content);

	return template({
		url: link
	});
}

function serialize(query) {
	var queryString = '';
	var connector = '?';

	_.forIn(query, function(value, key) {
		//if( ! _.isEmpty(value)){
		queryString = queryString + connector + key + '=' + value;
		connector = '&';
		//}
	});

	return queryString;
}

function urlExists(url) {
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status != 404;
}

/* function log(alertType, message) {
	var $dataElement = $('#data');
	var $parent = $dataElement.parent();
	if (alertType == 'hide') {
		$parent.hide();

		return;
	}

	var glyphicon = 'glyphicon glyphicon-refresh glyphicon-refresh-animate';

	if (alertType == 'success') {
		glyphicon = 'glyphicon glyphicon-ok';
	} else if (alertType == 'danger') {
		glyphicon = 'glyphicon glyphicon-ban-circle';
	}

	$parent
		.find('.glyphicon')
		.removeClass()
		.addClass(glyphicon);

	$parent
		.hide()
		.removeClass()
		.addClass('alert alert-' + alertType)
		.show();

	$dataElement
		.fadeOut('fast')
		.html(message)
		.fadeIn('slow');
}
*/

function log(alertType, message) {
	return Messenger().post({
		message: message,
		type: alertType
	});
}

function getTemplate(fullPathTemplate) {

	return new Promise(function(resolve, reject) {
		// Using dummy div for dynamic loading and promise API
		$('<div>').load(fullPathTemplate, function(response, status, xhr) {
			if (status == "error") {
				var msg = "Sorry but there was an error: " + xhr.status + " " + xhr.statusText;
				reject(msg);
			}

			resolve(_.template(response));
		});
	});
}

//browser ID
function isBrowser(queryBrowser) {

	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName = navigator.appName;
	var fullVersion = '' + parseFloat(navigator.appVersion);
	var majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset, verOffset, ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset = nAgt.indexOf("Opera")) != -1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset + 6);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
		browserName = "Microsoft Internet Explorer";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In Chrome, the true version is after "Chrome"
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox"
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}
	// In most other browsers, "name/version" is at the end of userAgent
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
		(verOffset = nAgt.lastIndexOf('/'))) {
		browserName = nAgt.substring(nameOffset, verOffset);
		fullVersion = nAgt.substring(verOffset + 1);
		if (browserName.toLowerCase() == browserName.toUpperCase()) {
			browserName = navigator.appName;
		}
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if ((ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt('' + fullVersion, 10);
	if (isNaN(majorVersion)) {
		fullVersion = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}

	return browserName === queryBrowser;

}

function populateSelect($select, data, selectedOption) {
	var options = '';
	var selected = '';
	var text = '';

	data.forEach(function(obj) {
		selected = '';
		text = '';
		if (selectedOption !== undefined) {
			if (obj.id == selectedOption) {
				selected = 'selected=""';
			}
		}

		text = obj.name;
		if (obj.name == undefined) {
			text = obj.title;
		}

		options +=
			'<option value="' + obj.id + selected + '">' + text + '</options>';
	});

	$select.append(options);
}

function lookUpForCompany(business_id) {
	return $.get("/api/user-businesses/" + business_id, {
		csrftoken: getCookie('csrftoken')
	}).then(function(company) {
		$('.login-email').append($('<h6 id="header-company">' + company.name + ' (' + company.tokens + ' tokens)</h6>'));
		return company;
	});
}

/* Site wide on-load functions */

$(function() {
	/* Check if user is logged in and handel issues such as non completed reg. */
	var login = checkLogin();
	var pathArray = window.location.pathname.split('/');
	var segment_1 = pathArray[1];

	if (login) {
		//redirect exeptions
		if (segment_1 == 'profile') {
			userTypeMenuConfiguration();
		} else {
			userTypeMenuConfiguration(true);
		}
	}

	//$('.brand-pills > li.active').removeClass('active');

	// Screens menu highlight when page are active
	var pathname = window.location.pathname.split('/').filter(function(value) {
		return value != ""
	});
	var href = pathname[0];
	$('a[href*="' + href + '"]', '#myNavbar').parent().addClass('active');

	if (pathname[1] != undefined && pathname[1] !== '') {
		href = href + '/' + pathname[1];
		$('a[href*="' + href + '"]').parent().addClass('active');
	}

	// Config Messenger (Notification Systems)
	Messenger.options = {
		extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
		theme: 'future'
	}

	//Form submit code - Login
	$('#login').submit(function(event) {
		event.preventDefault();
		var email = $('#email').val();
		var password1 = $('#password').val();
		var csrfmiddlewaretoken = $('[name="csrfmiddlewaretoken"]').val();
		$.post("/api-rest-auth/login/", {
			email: email,
			password: password1,
			csrfmiddlewaretoken: csrfmiddlewaretoken

		}).done(function(data) {
			setCookie('email', email, 28);
			setCookie('key', data.key, 28);
			window.location.href = "/applications/";

		}).fail(function(data) {
			var messageError = '';

			for (var key in data.responseJSON) {
				var obj = data.responseJSON[key];
				messageError = messageError + obj + '<br>';
			}

			formAlert('danger', messageError);
		});
	});

	//Form submit code - Reg
	//$('#regJobSeekerModal, #regRecruiterModal').submit(function (event) {
	$('.register').submit(function(event) {
		event.preventDefault();
		var email = $('#reg_email', this).val();
		var password1 = $('#password1', this).val();
		var password2 = $('#password2', this).val();
		var csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val();

		log('info', 'Registering ...');

		$.post("/api-rest-auth/registration/", {
			email: email,
			password1: password1,
			password2: password2,
			csrfmiddlewaretoken: csrfmiddlewaretoken

		}).done(function(key) {

			$.post("/api-rest-auth/login/", {
				email: email,
				password: password1,
				csrfmiddlewaretoken: csrfmiddlewaretoken

			}).done(function(data) {
				var company_name = $('#reg_name').val();

				if (company_name) {
					userBusinessStore.post({
						name: company_name

					}).done(function(data) {
						log('success', 'You are registered!');
						log('info', 'Complete your profile...');

						setCookie('email', email, 28);
						setCookie('key', data.key, 28);
						window.location.href = "/profile/recruiter/create/";

					}).fail(function(data) {
						var messageError = '';

						for (var key in data.responseJSON) {
							var obj = data.responseJSON[key];
							messageError = messageError + obj + '<br>';
						}

						formAlert('error', messageError);
					});
				} else {
					log('success', 'You are registered!');
					log('info', 'Complete your profile...');

					setCookie('email', email, 28);
					setCookie('key', data.key, 28);
					window.location.href = "/profile/job-seeker/create";
				}

			}).fail(function(argument) {
				var messageError = '';

				for (var key in data.responseJSON) {
					var obj = data.responseJSON[key];
					messageError = messageError + obj + '<br>';
				}

				formAlert('error', messageError);
			});

		}).fail(function(data) {
			$.post("/api-rest-auth/login/", {
				email: email,
				password: password1,
				csrfmiddlewaretoken: csrfmiddlewaretoken

			}).done(function(argument) {
				log('success', 'User registered!');

				setCookie('email', email, 28);
				setCookie('key', data.key, 28);
				window.location.href = "/profile/job-seeker/edit";

			}).fail(function(argument) {
				var messageError = '';

				for (var key in data.responseJSON) {
					var obj = data.responseJSON[key];
					messageError = messageError + obj + '<br>';
				}

				formAlert('error', messageError);
			});
		});
	});

	$('#regModal').on('hidden.bs.modal', function() {
		$('.alert').html('');
		$('.alert').hide();
	});

	$('#loginModal').on('hidden.bs.modal', function() {
		$('.alert').html('');
		$('.alert').hide();
	});

	$('#viewPitchModal').on('hidden.bs.modal', function() {
		$('#viewPitchModal').find('.modal-body').html('<div class="col-md-12" id="pitchViewer"></div><div class="col-md-offset-4 col-md-4"><a class="btn btn-custom" id="applyButtonModal" style="display:none; margin-left: 18px;margin-top: 20px;">Connect</a></div>');
	});

	// TODO: Change all checkbox html for using the new titatoggle library
	//$("input[type='checkbox']").bootstrapToggle();

	/* For not selected or default option on SELECT DOM element */
	$("select").on('change', function() {
		var sel = this;
		if (sel.options[sel.selectedIndex].value == '') {
			sel.style.color = '#999';
		} else {
			sel.style.color = 'black';
		}
	});
});