var userBusinessStore = {
	get: function(data, context){
		return $.get("/api/user-businesses/" + context.business_id, data);
	},

	put: function(data, context){
		return $.put("/api/user-businesses/" + context.business_id + "/", data);
	},

	post: function(data, context) {
		return $.post("/api/user-businesses/", data);
	},

	postImages: function(data, context) {
		return $.ajax({
			url: '/api/user-business-images/',
			type: 'POST',
			data: data,
			cache: false,
			contentType: false,
			processData: false
		});
	}
}