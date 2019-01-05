//
//  Controller function for the model
//
//

var app = angular.module('Simulation', []);


app.controller('SimulationController',function  ($scope, $interval) {
    $scope.viewport = {
        universeWidth: null,
        universeHeight: null
    }

	$scope.simulation = new Simulation(
		document.getElementById("monverse")
    );

	$scope.simulation.addSun(10000,0.5);
	$scope.simulation.addRandomBodies(5,
		0.5,2,
		1,10,
		0.02);
	$scope.height;
	$scope.width;

    interval = 1 / $scope.simulation.frame_rate;


    $interval(function() {
        $scope.simulation.iterate();
    }, interval * 1000)

});

app.directive('miniMon', function () {
    return {
        restrict: 'E',
        scope : {
            coords: "="
        },
        template: '<img class="minimon" src="images/MonGlobeWhite.gif" alt="minithrob">',
        link: function (scope, e, attrs) {
            scope.$watch('coords', function() {
                elem = e.children();

                var coords = scope.coords;

                elem.id = coords.id;
                if (coords.displayed) {
                    elem.show()
                } else {
                    elem.hide()
                }
                elem.attr('title','ff');
                elem.css({
                    'width': coords.width + "px",
                    'height': coords.height + "px",
                    'top': (coords.rows - coords.height/2) + "px",
                    'left': (coords.cols - coords.width/2 ) + "px",
                    'z-index': coords.z_index
                });
            });
        }
    }});
/*
    app.directive('monverse', function () {
        return {
            restrict: 'A',
            transclude: true,
            scope : {
                width: '=',
                height: '='
            },
            template: '<div class="monverse" ng-transclude></div>',
            link: function (scope, e, attrs) {
                scope.height = e.prop('clientHeight');
                scope.width  = e.prop('clientWidth');
            }
        }
    })
*/
