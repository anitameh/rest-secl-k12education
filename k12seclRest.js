/**
 * @author: Anita Mehrotra
 * @date: October 3, 2014
 */

var margin = {
 	top: 50,
 	right: 50,
 	bottom: 50,
 	left: 50
};

var width = 960 - margin.left - margin.right,
	height = 1160 - margin.bottom - margin.top,
	centered;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var first_dis_secl = [];

d3.csv("data/fakeCA200.csv", function(error, data) {
// d3.csv("data/california-merged.csv", function(error, data) {
	var allschools = [];
	data.forEach( function(d) {
		allschools.push(d.School_name);
	});
	console.log(allschools);

	// console.log(data);
	// console.log(allschools);
	// get dis_phys_restraints data for FIRST school and its neighbors
	var dis_phys_restraints = [];
	var total_enrollment = [];

	// get first ("main") school
	var i = 0;
	var main_school_obj = data[i];

	// first ("main") school's data
	dis_phys_restraints.push( parseInt(main_school_obj.dis_phys_restraints) );
	// console.log( dis_phys_restraints );

	// get neighbors
	var neighbors = main_school_obj.Neighbors;
	neighbors = neighbors.slice(1, neighbors.length-1);
	neighbors = neighbors.split(',')

	console.log( neighbors );
	console.log( neighbors.length );
	console.log( typeof(neighbors) );

	// get data for neighbors
	for (var i = 0; i < neighbors.length; i++) {
		// console.log(i);
		if ( allschools.indexOf(neighbors[i]) > -1 ) {
			console.log( allschools.indexOf(neighbors[i]) );
			console.log( neighbors[i] );
		}
		else {
			// console.log(neighbors[i] + " not in there");
		}
	}





});


// d3.json("data/fakeCA200.json", function(error, data) {

// 	if (error) return console.error(error);

// 	console.log(data);
// });



