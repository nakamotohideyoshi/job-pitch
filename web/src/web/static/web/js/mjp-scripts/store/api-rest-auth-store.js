var ApiRestAuth = {
	registration: {
		post: function(data) {
			return new Promise(function(resolve, reject) {
				$.post("/api-rest-auth/registration/", data).done(function(key) {
					resolve(key);
				}).fail(function(response) {
					reject(response);
				});
			});
		}
	},
	login: {
		post: function(data) {
			return new Promise(function(resolve, reject) {
				$.post("/api-rest-auth/login/", data).done(function(response) {
					resolve(response);
				}).fail(function(response) {
					reject(response);
				});
			});
		}
	},

	user: {
		get: function() {
			return new Promise(function(resolve, reject) {
				$.get("/api-rest-auth/user/", {
					token: getCookie('key'),
					csrftoken: getCookie('csrftoken')
				}).done(function(response) {
					resolve(response);
				}).fail(function(response) {
					reject(response);
				});
			});
		}
	}
};
