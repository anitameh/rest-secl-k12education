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
	subWidth = width/4
	subHeight = height/5.;

console.log(height/5);
// console.log(height/6);


var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top +")");

var x0 = d3.scale.ordinal()
	.rangeRoundBands( [0, subWidth], .1 );

var x1 = d3.scale.ordinal()
	.rangeRoundBands( [0, subWidth], .1 );

var y0 = d3.scale.linear()
	.range( [subHeight, 0] );

var y1 = d3.scale.linear()
	.range( [20+2*subHeight, 20+subHeight] );



var xAxis = d3.svg.axis()
	.scale(x0)
	.ticks(0)
	.orient("bottom");

var yAxis0 = d3.svg.axis()
	.scale(y0)
	.orient("left")
		.ticks(10);
		// .ticks(10, "%");
var yAxis1 = d3.svg.axis()
	.scale(y1)
	.orient("left")
		.ticks(10);

// d3.csv("data/fakeCA200.csv", function(error, data) {
d3.csv("data/california-merged.csv", function(error, data) {

	// get all schools
	var allschools = [];
	data.forEach( function(d) {
		allschools.push(d.School_name);
	});

	//////////////////////////////////////////////////
	// 1. get data for FIRST school and its neighbors
	/////////////////////////////////////////////////
	var dis_mech_restraints = {};
	var dis_phys_restraints = {};
	var dis_seclusions = {};

	var no_dis_mech_restraints = {};
	var no_dis_phys_restraints = {};
	var no_dis_seclusions = {};

	// get first ("main") school
	var i = 0;
	var main_school_obj = data[i];
	var ms_total_enrollment = parseInt(main_school_obj.total_enrollment)
	console.log(main_school_obj);

	// first ("main") school's data
	dis_mech_restraints[main_school_obj.School_name] = (parseInt(main_school_obj.idea_mech_restraints)+parseInt(main_school_obj.section_504_mech_restraints)) / ms_total_enrollment;
	dis_phys_restraints[main_school_obj.School_name] = (parseInt(main_school_obj.idea_phys_restraints)+parseInt(main_school_obj.section_504_phys_restraints)) / ms_total_enrollment;
	dis_seclusions[main_school_obj.School_name] = (parseInt(main_school_obj.idea_seclusion)+parseInt(main_school_obj.section_504_seclusion)) / ms_total_enrollment;

	no_dis_mech_restraints[main_school_obj.School_name] = parseInt(main_school_obj.no_dis_mech_restraints) / ms_total_enrollment;
	no_dis_phys_restraints[main_school_obj.School_name] = parseInt(main_school_obj.no_dis_phys_restraints) / ms_total_enrollment;
	no_dis_seclusions[main_school_obj.School_name] = parseInt(main_school_obj.no_dis_seclusion) / ms_total_enrollment;

	// get neighbors
	var neighbors = main_school_obj.Neighbors;
	neighbors = neighbors.slice(1, neighbors.length-1);
	neighbors = neighbors.split(', ')

	// get data for neighbors
	var j = 0;
	for (var i = 0; i < neighbors.length; i++) {

		var theschool = neighbors[i].slice(1, neighbors[i].length-1);
		var theschool_index = allschools.indexOf(theschool)
		
		if ( theschool_index > -1 ) {

			var theschool_name = data[theschool_index].School_name;
			var theschool_enroll = parseInt(data[theschool_index].total_enrollment);

			dis_mech_restraints[theschool_name] = (parseInt(data[theschool_index].idea_mech_restraints)+parseInt(data[theschool_index].section_504_mech_restraints)) / theschool_enroll;
			dis_phys_restraints[theschool_name] = (parseInt(data[theschool_index].idea_phys_restraints)+parseInt(data[theschool_index].section_504_phys_restraints)) / theschool_enroll;
			dis_seclusions[theschool_name] = (parseInt(data[theschool_index].idea_seclusion)+parseInt(data[theschool_index].section_504_seclusion)) / theschool_enroll;
			
			no_dis_mech_restraints[theschool_name] = parseInt(data[theschool_index].no_dis_phys_restraints) / theschool_enroll;
			no_dis_phys_restraints[theschool_name] = parseInt(data[theschool_index].idea_phys_restraints) / theschool_enroll;
			no_dis_seclusions[theschool_name] = parseInt(data[theschool_index].idea_seclusion) / theschool_enroll;

		}

	}
	// console.log(dis_mech_restraints);
	// console.log(dis_phys_restraints);
	// console.log(dis_seclusions);
	// console.log(no_dis_mech_restraints);
	// console.log(no_dis_phys_restraints);
	// console.log(no_dis_seclusions);

	//////////////////////////////////////////////////
	// 2. create histograms (FIRST school + neighbors)
	/////////////////////////////////////////////////

	// all features histogram
	// var dis_mech_restraints_vals = d3.values(dis_mech_restraints);
	// var dis_phys_restraints = d3.values(dis_phys_restraints);
	var dis_mech_restraints_vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 
							13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
	var dis_phys_restraints_vals = d3.values(dis_phys_restraints).slice(0,25);
	console.log(dis_phys_restraints_vals)

	x0.domain(dis_mech_restraints_vals.map( function(d) { return d; } ));
	x1.domain(dis_phys_restraints_vals.map( function(d) { /*console.log(d);*/ return d; } ));

	// y.domain( [0, d3.max(dis_mech_restraints_vals)] );
	y0.domain( [0, 100] );
	y1.domain( [0, 100] );

	// MECHANICAL, DISABLED
	// append xAxis
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + subHeight + ")")
			.call(xAxis);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.call(yAxis0)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("% Mechanical (Disabled)");

	// append bars
	svg.selectAll("bar")
			.data(dis_mech_restraints_vals)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { 
				// console.log("x0(i) = " + x0(i));
				return x0(i); 
			})
			.attr("width", x0.rangeBand())
			.attr("y", function(d) { 
				// console.log("height of bar " + d + " = "+ (height/2 - y(d)) );
				return y0(d); 
			})
			.attr("height", function(d) { return subHeight - y0(d); });

	// PHYSICAL, DISABLED
	// append xAxis
	// console.log(dis_phys_restraints_vals);
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (20 + 2*subHeight) + ")")
			.call(xAxis);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.call(yAxis1)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -(20+subHeight))
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("% Physical (Disabled)");

	// append bars
	svg.selectAll("bar")
			.data(dis_mech_restraints_vals)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { 
				console.log(i + " x0(i) = " + x0(i));
				console.log(i + " x1(i) = " + x1(i));
				return x0(i); 
			})
			.attr("width", x0.rangeBand())
			.attr("y", function(d) { 
				return y1(d); 
			})
			.attr("height", function(d) { return (20 + 2*subHeight) - y1(d); });

});




