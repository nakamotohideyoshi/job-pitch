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

//if redirect is true, send user to login
function checkLogin(redirect){
	var username = getCookie('username');
	if(username == ""){
		if(redirect == true){
			window.location.href = "/login";
		}else{
			//show login & reg links
			$('.not_logged_in_menu').show();
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
	$('#logged_in_menu').show();
	
	
}

// Get the user type (business or job_seeker) return true for business false for job seeker
function userTypeCheckIsBusiness(){
			  $.get( "/api-rest-auth/user/", { token: getCookie('key') ,csrftoken: getCookie('csrftoken') }).done(function( data ) {
				
				if (data.businesses.length){
    				// business
					$('.business-link').show();
				}else if (data.job_seeker !== null){
	    			// job-seeker
					$('.job-seeker-link').show();
				}else{
				    // Go Finish registration
					//window.location.href = "/profile";
				}
				
			  })
			  .fail(function( data ) {
				console.log( data );
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


/* Site wide on-load functions */

$(function() {
	/* Check if user is logged in */
	var login = checkLogin();
	if(login){
		userTypeCheckIsBusiness();
	}
});
