(function() {
'use strict';

	angular.module('<%= title %>.<%= url %>', [])

	.controller('<%= section %>', function($scope) {
	
	})

	.config(function($stateProvider) {
		$stateProvider.state('app.<%= url %>', {
			url: '/<%= url %>',
			views: {
				'appContent' : {
					templateUrl: 'sections/<%= url %>/<%= url %>.html',
					controller: '<%= section %>'
				}
			}
		});
	});
})();