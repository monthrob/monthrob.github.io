
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
	this.bottom = new Gravity.Vector(-2,-2);
	this.top    = new Gravity.Vector(2,2);
	
	this.universe_el = universe_el;
	this.template_el = template_el;
	//  Set up timeout
	this.frame_rate = 25;
	this.subdivisions = 100;
	this.speedup = 2;

	this.interval = 1 / this.frame_rate;
	var myself = this;
	this.interval_id   = setInterval(function(){myself.iterate()},this.interval*1000);
}

Simulation.prototype = {
	addRandomBodies : function (n_planets,min_r,max_r,min_mass,max_mass,unit_size) {
//		var monverse_el = document.getElementById("monverse");
//		var n_planets = 5;

		// Random orbiting planets
		for (var i =0; i < n_planets; i++) {
			var mass = min_mass + (Math.random() * (max_mass - min_mass) );
			// Use polar coordinates 
			// 1. Choose a random radius 
			// 2. Chose  a random ange from 0 360 = 2*pi in radians 
			var pos = new Gravity.Vector(min_r + Math.random()*(max_r - min_r),0)
							.rotate(Math.random()*2*Math.PI);
			var newNode =this.template_el.cloneNode();
			this.universe_el.appendChild(newNode);
			var name =  "minimon1"+i
			newNode.id = name
			newNode.style.display="";
			newNode.style.width=mass*unit_size+"px";
			newNode.style.height=mass*unit_size+"px";
			
			this.addBody(name,mass,pos,this.universe.getOrbitalVelocity(pos,mass,1));
		}
		this.paint();
},
	addBody: function (id,  mass, pos, vel) {
		this.elements.push(id);
		this.universe.addBody(id,mass,pos,vel);
	},
	iterate: function() {
		for (var i = 0; i < this.subdivisions; i++) {
			this.universe.iterate(this.interval*this.speedup/this.subdivisions);
		}
		this.paint();
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
		var scale_vec = new Gravity.Vector(x_scale,y_scale);
		
		this.move("mainmon",height/2,width /2);
		
		move_sun();

		for (i in this.elements) {
			var id    = this.elements[i];
			var body  = this.universe.bodies[id];
			var coors = body.viewportCoord(0,0,height,width,this.bottom.scalev(scale_vec),this.top.scalev(scale_vec)); 
			this.move(id,coors.rows, coors.cols);
		}
	},
	move: function (id, rows, cols) {
			var el = document.getElementById(id);
			var height = el.clientHeight;
			var width  = el.clientWidth;
			
			el.style.top =  (rows - height/2) + "px";
			el.style.left  = (cols - width/2 ) + "px";
	}

}

