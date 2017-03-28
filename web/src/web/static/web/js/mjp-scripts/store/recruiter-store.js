var userBusinessStore = {
	get: function(data, context) {
		return $.get("/api/user-businesses/" + context.business_id, data)
			.done(function(response) {
				return response;
			});
	},

	put: function(data, context) {
		return $.put("/api/user-businesses/" + context.business_id + "/", data)
			.done(function(response) {
				return response;
			});
	},

	post: function(data, context) {
		return $.post("/api/user-businesses/", data)
			.done(function(response) {
				return response;
			});
	},

	postImages: function(data, context) {
		return $.ajax({
			url: '/api/user-business-images/',
			type: 'POST',
			data: data,
			cache: false,
			contentType: false,
			processData: false
		}).done(function(response) {
			return response;
		});

	}
};