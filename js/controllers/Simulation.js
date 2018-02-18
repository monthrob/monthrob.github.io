//
//  Controller function for the model
//
//

var app = angular.module('Simulation', []);


app.controller('SimulationController',function  ($scope) {

	$scope.simulation = new Simulation(
		document.getElementById("monverse"),
		document.getElementById("minimon")
	);

	$scope.simulation.addSun(10000,0.5);
	$scope.simulation.addRandomBodies(5,
		0.5,2,
		1,10,
		0.02);

});

