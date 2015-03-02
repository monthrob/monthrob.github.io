
//  Simulation module
// (c) Monish Biswas 2015
//
//  Classes
//




Simulation = function (universe_el,template_el) {
	//  Holds the canves for the universe
	this.universe_el = universe_el;
	this.elements =[];
	this.universe = new Gravity.Universe();
	this.bottom = new Gravity.Vector(-2,-2,-2);
	this.top    = new Gravity.Vector(2,2,2);

	this.universe_el = universe_el;
	this.template_el = template_el;
	//  Set up timeout
	this.frame_rate = 25;
	this.subdivisions = 100;
	this.speedup = 2;

	this.interval = 1 / this.frame_rate;
	var myself = this;
	this.interval_id   = setInterval(function(){myself.iterate()},this.interval*1000);

	this.last_model_time = null;
	this.last_paint_time = null;

	this.view_distance = 0.5;
}

Simulation.prototype = {
	addSun: function (mass, radius) {
		this.sun = new Gravity.Body (
		mass,
		radius,
		new Gravity.Vector (0,0,0),
		new Gravity.Vector (0,0,0));
	},
	addRandomBodies : function (n_planets,min_r,max_r,min_mass,max_mass,unit_size) {
		// Random orbiting planets
		for (var i =0; i < n_planets; i++) {
			var mass = min_mass + (Math.random() * (max_mass - min_mass) );
			// Use polar coordinates
			// 1. Choose a random radius
			// 2. Chose  a random ange from 0 360 = 2*pi in radians
			var the_r = min_r + Math.random()*(max_r - min_r)
			var angle_z = Math.random()*2*Math.PI;
			var angle_x = Math.random()*2*Math.PI;
			
			var pos = new Gravity.Vector(the_r,0,0).rotate(angle_z,"Z").rotate(angle_x,'X');
			var newNode =this.template_el.cloneNode();
			this.universe_el.appendChild(newNode);
			var name =  "minimon1"+i
			newNode.id = name
			newNode.style.display="";
			var orb_vel = this.universe.getOrbitalVelocity(new Gravity.Vector(the_r,0,0),mass,0).rotate(angle_z,"Z").rotate(angle_x,'X');
			this.addBody(name,mass, mass*unit_size, pos,orb_vel);
		}
		this.paint();
},
	addBody: function (id,  mass, radius, pos, vel) {
		this.elements.push(id);
		this.universe.addBody(id,mass,radius,pos,vel);
	},
	iterate: function() {
//     Performance.now() nto supported on iOS
//		var time = performance.now() ;
		for (var i = 0; i < this.subdivisions; i++) {
			this.universe.iterate(this.interval*this.speedup/this.subdivisions);
		}
//		var model_time = performance.now() - time;
		this.paint();
//		var paint_time = performance.now() - time - model_time;
//		this.last_model_time = model_time;
//		this.last_paint_time = paint_time;
	},
	paint: function () {
		var height = this.universe_el.clientHeight;
		var width  = this.universe_el.clientWidth;

		// Try and maintain aspect ratio
		// By expanding view port
		var x_scale=1;
		var y_scale=1;
		if (height > width) {
			y_scale = height / width;
		} else if (width > height) {
			x_scale = width / height;
		}
		var scale_vec = new Gravity.Vector(x_scale,y_scale,1);
		coors  = this.sun.viewportCoord(0,0,height,width, this.view_distance, this.bottom.scalev(scale_vec),this.top.scalev(scale_vec));
		this.move("mainmon",coors.rows, coors.cols,coors.width, coors.height,coors.z_index);

		move_sun();

		for (i in this.elements) {
			var id    = this.elements[i];
			var body  = this.universe.bodies[id];
			var coors = body.viewportCoord(0,0,height,width,this.view_distance, this.bottom.scalev(scale_vec),this.top.scalev(scale_vec));
			this.move(id,coors.rows, coors.cols,coors.width,coors.height,coors.z_index);
		}
	},
	move: function (id, rows, cols,width,height,z_index) {
		var el = document.getElementById(id);
		if (typeof width === "undefined") {
			width  = el.clientWidth;
		} else {
			el.style.width = width + "px";
		}
		if (typeof height === "undefined") {
			var height = el.clientHeight;
		} else {
			el.style.height = height + "px";
		}

		el.style.top =  (rows - height/2) + "px";
		el.style.left  = (cols - width/2 ) + "px";
		el.style.zIndex  = z_index;

	}

}

