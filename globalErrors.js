'use strict';

angular.module('GlobalErrors', [])
	.factory('GlobalErrors', function(notificationFactory) {
		var errors = {
			0: function(errorResponse) {
				notificationFactory.error(0, 'Error ' + errorResponse.status + ': ' + errorResponse.data);
			},
			401: function() {
				notificationFactory.error(401, 'Uh oh.. You are not logged in. Please log in again. Thank you.');
			},
			403: function() {
				notificationFactory.error(403, 'Sorry, you have not enough cats to view this');
			},
			500: function(errorResponse) {
				notificationFactory.error(500, 'Server internal error: ' + errorResponse.data);
			}
		};

		return {
			set: function(code, callback) {
				errors[code] = callback;
			},
			run: function(code, response) {
				if(errors[code] === undefined)
				{
					code = 0;
				}

				if(errors[code] !== undefined && typeof(errors[code]) === 'function')
				{
					errors[code](response);
				}
			}
		};
	})
	.config(function ($provide, $httpProvider, $compileProvider) {
		var elementsList = $();

		$httpProvider.responseInterceptors.push(function ($timeout, $q, notificationFactory, AppLoader, GlobalErrors) {
			return function (promise) {
				AppLoader.show();
				return promise.then(function (successResponse) {
					// Don't push the notification on success here, let the controller decide to push the notification
					// The controller needs a callback function we set in the controller and run here..
					AppLoader.hide();
					return successResponse;
				}, function (errorResponse) {
					GlobalErrors.run(errorResponse.status, errorResponse);
					AppLoader.hide();
					return $q.reject(errorResponse);
				});
			};
		});
	});