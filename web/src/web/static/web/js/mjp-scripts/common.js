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


/* Site wide on-load functions */

$(function() {
	/* Check if user is logged in */
	var login = checkLogin();
});
