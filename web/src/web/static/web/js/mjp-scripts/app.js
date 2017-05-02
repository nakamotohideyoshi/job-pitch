/* Site wide on-load functions
 *
 * Run when all document is loaded
 */
$(function() {
	context.redirectIfNotLoggedIn = false;

	app(context).then(function(user) {
		home(context);
	}).catch(function(response) {
		console.log("response", response);

	});
});
