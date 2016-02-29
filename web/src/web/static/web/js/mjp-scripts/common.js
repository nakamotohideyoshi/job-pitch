/* Common Functions */

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/;";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

function deleteCookie(cname){
	document.cookie = cname+"=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";	
}

//get lat long and other data from postcode
function postcodeLocationData(postcode, handleData){
		$.ajax({ cache: false,
			url: "http://api.postcodes.io/postcodes/"+postcode,
			success: function (data) {
				handleData(data);
			},
			error: function (data) {
				var response = JSON.parse(data.responseText);
				console.log(response.error);
				formAlert('danger', response.error);
			}
		});
}

//if redirect is true, send user to login
function checkLogin(redirect){
	var username = getCookie('username');
	if(username == ""){
		if(redirect == true){
			window.location.href = "/login";
		}else{
			//show login & reg links
			$('.not_logged_in_menu').show();
			$('.not_logged_in_element').show();
			$('.login-username').hide();
			return false;
		}	
	}else{
		setHeaderUsername();
		
		return true;
	}
}

function setHeaderUsername(){
	var username = getCookie('username');
	$('#header_username').html(username);
	// Display said menu
	$('.logged_in_menu').show();
	
	
}

function applyForJob(job_id, job_seeker_id){
			  $.post( "/api/applications/", { job: job_id, job_seeker: job_seeker_id, csrftoken: getCookie('csrftoken')}).done(function( data ) {
				  $('#applyButton').fadeOut(200,function(){
						$('#job_applied_for').show();
					});
			  })
			  .fail(function( data ) {
				
			  });
}

function connectWithJob(job_id, job_seeker_id){
			  $.post( "/api/applications/", { job: job_id, job_seeker: job_seeker_id, csrftoken: getCookie('csrftoken')}).done(function( data ) {
				  //location.reload();
				  $('#viewPitchModal').find('.modal-body').html('<div class="row"><div class="col-md-12"><h4 style="text-align: center; font-size:16px;">Thanks for requesting to connect. A message has been sent to the job seeker</h4></div></div><div class="row"><div class="col-md-12" style="text-align:center;"><button style="margin-left:0;" type="button" class="btn btn-custom" data-dismiss="modal" aria-label="Close">Back to List</button></div></row>');
				  $('#job-list-'+job_seeker_id).remove();
			  })
			  .fail(function( data ) {
				
			  });
}


function messageRead(message_id){
			$.put( "/api/messages/"+message_id+'/', { read:true, csrftoken: getCookie('csrftoken')}).done(function( data ) {
;
				  
			  })
			  .fail(function( data ) {
				
			  });
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

// Get the user type(business or job_seeker) & sort the menus out.
function userTypeMenuConfiguration(redirectToProfile){
			  $.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				
				if (data.businesses.length){
    				// business
					$('.business-link').show();
				}else if (data.job_seeker != null){
	    			// job-seeker
					$('.job-seeker-link').show();
				}else{
				    // Go Finish registration
					if(redirectToProfile == true){
						window.location.href = "/profile";
					}
				}
				
			  })
			  .fail(function( data ) {
				console.log( data );
			  });
			  
}


function formAlert(type, message){
	$('.alert').addClass('alert-'+type);
	$('.alert').html(message);
	$('.alert').show();
}

function deleteRow(id, apiFunction, rowPrefix){
	bootbox.confirm("Are you sure?", function(result) {
		$.ajax({
			url: "/api/"+apiFunction+"/"+id+"/",
			type: 'DELETE',
			data:{ csrftoken: getCookie('csrftoken') },
			success: function(result) {
				console.log(rowPrefix+id);
				$('#'+rowPrefix+id).fadeOut(250);
			}
			});
	});
}

//check if a job seeker account is active. Returns true|false

function account_active_check(){
		$.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				  
				  job_seeker_id = data.job_seeker;
				  
				  $.get( "/api/job-seekers/"+data.job_seeker, { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
					  return data.active;
				  });
				  
		});
}

// Some handy helpers

$.put = function(url, data, callback, type){
 
  if ( $.isFunction(data) ){
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

$.delete = function(url, data, callback, type){
 
  if ( $.isFunction(data) ){
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

function deleteJobSeekerFromJob(job_id,job_seeker){
	
}

function viewPitch(url, job_id, job_seeker){
	$('#pitchViewer').html('');
	$('#pitchViewer').html('<video width="320" height="240" controls><source src="'+url+'" type="video/mp4"></video>');
	$('#applyButtonModal').attr('href','javascript:connectWithJob('+job_id+','+job_seeker+');');
	$('#deleteButtonModal').attr('href','javascript:deleteJobSeekerFromJob('+job_id+','+job_seeker+');');
	$('#applyButtonModal').show();
	$('#deleteButtonModal').show();
	$('#viewPitchModal').modal('show');
}

function viewPitch2(url, job_id, job_seeker){
	$('#pitchViewer').html('');
	$('#pitchViewer').html('<video width="320" height="240" controls><source src="'+url+'" type="video/mp4"></video>');
	$('#viewPitchModal').modal('show');
}

/* Site wide on-load functions */

$(function() {
	/* Check if user is logged in and handel issues such as non completed reg. */
	var login = checkLogin();
	var pathArray = window.location.pathname.split( '/' );
	var segment_1 = pathArray[1];
	if(login){
		//redirect exeptions
		if(segment_1 == 'profile'){
			userTypeMenuConfiguration();
		}else{
			userTypeMenuConfiguration(true);
		}
	}
	//Form submit code - Login
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
				var messageError = ''
				for (var key in data.responseJSON) {
					var obj = data.responseJSON[key];
					messageError = messageError+obj+'<br>';
				}
				formAlert('danger', messageError);
			  });
	});
	
	//Form submit code - Reg
	$('#register').submit(function( event ) {
		event.preventDefault();
		var username = $('#reg_username').val();
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
	$('#regModal').on('hidden.bs.modal', function () {
		$('.alert').html('');
		$('.alert').hide();
	});
	$('#loginModal').on('hidden.bs.modal', function () {
		$('.alert').html('');
		$('.alert').hide();
	});
	$('#viewPitchModal').on('hidden.bs.modal', function () {
		$('#viewPitchModal').find('.modal-body').html('<div class="col-md-12" id="pitchViewer"></div><div class="col-md-offset-4 col-md-4"><a class="btn btn-custom" id="applyButtonModal" style="display:none; margin-left: 18px;margin-top: 20px;">Connect</a></div>');
	});
});
