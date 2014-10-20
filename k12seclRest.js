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
	subWidth = width/4;
	subHeight = height/5.;

// svg
var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top +")");


// mechanical, disabled 
var x0 = d3.scale.ordinal()
	.rangeRoundBands( [0, subWidth], .1 );

var y0 = d3.scale.linear()
	.range( [subHeight, 0] );

var xAxis0 = d3.svg.axis()
	.scale(x0)
	.tickSize(0, 0)
	.orient("bottom");

xAxis0.tickFormat( function(d) { return ''; });

var yAxis0 = d3.svg.axis()
	.scale(y0)
	.orient("left")
		.ticks(10);


// physical, disabled 
var x1 = d3.scale.ordinal()
	.rangeRoundBands( [0, subWidth], .1 );

var y1 = d3.scale.linear()
	.range( [subHeight, 0] );

var xAxis1 = d3.svg.axis()
	.scale(x1)
	.tickSize(0, 0)
	.orient("bottom");

xAxis1.tickFormat( function(d) { return ''; });

var yAxis1 = d3.svg.axis()
	.scale(y1)
	.orient("left")
		.ticks(10);


// seclusions, disabled
var x2 = d3.scale.ordinal()
	.rangeRoundBands( [0, subWidth], .1 );

var y2 = d3.scale.linear()
	.range( [subHeight, 0] );

var xAxis2 = d3.svg.axis()
	.scale(x2)
	.tickSize(0, 0)
	.orient("bottom");

xAxis2.tickFormat( function(d) { return ''; });

var yAxis2 = d3.svg.axis()
	.scale(y2)
	.orient("left")
		.ticks(10);


// mechanical, not disabled
var x3 = d3.scale.ordinal()
	.rangeRoundBands([0, subWidth], .1);

var y3 = d3.scale.linear()
	.range( [50 + 2*subHeight, 50 + subHeight] );

var xAxis3 = d3.svg.axis()
	.scale(x3)
	.tickSize(0, 0)
	.orient("bottom");

xAxis3.tickFormat( function(d) { return ''; });

var yAxis3 = d3.svg.axis()
	.scale(y3)
	.orient("left")
		.ticks(10);



// physical, not disabled
var x4 = d3.scale.ordinal()
	.rangeRoundBands([0, subWidth], .1);

var y4 = d3.scale.linear()
	.range( [50 + 2*subHeight, 50 + subHeight] );

var xAxis4 = d3.svg.axis()
	.scale(x4)
	.tickSize(0, 0)
	.orient("bottom");

xAxis4.tickFormat( function(d) { return ''; });

var yAxis4 = d3.svg.axis()
	.scale(y4)
	.orient("left")
		.ticks(10);


// seclusions, not disabled
var x5 = d3.scale.ordinal()
	.rangeRoundBands([0, subWidth], .1);

var y5 = d3.scale.linear()
	.range( [50 + 2*subHeight, 50 + subHeight] );

var xAxis5 = d3.svg.axis()
	.scale(x5)
	.tickSize(0, 0)
	.orient("bottom");

xAxis5.tickFormat( function(d) { return ''; });

var yAxis5 = d3.svg.axis()
	.scale(y5)
	.orient("left")
		.ticks(10);

// tooltip
var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);



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
			no_dis_phys_restraints[theschool_name] = parseInt(data[theschool_index].no_dis_phys_restraints) / theschool_enroll;
			no_dis_seclusions[theschool_name] = parseInt(data[theschool_index].no_dis_seclusion) / theschool_enroll;

		}

	}

	//////////////////////////////////////////////////
	// 2. create histograms (FIRST school + neighbors)
	/////////////////////////////////////////////////

	// DATA
	// var dis_mech_restraints_vals = d3.values(dis_mech_restraints); // mechanical, disabled
	var dis_mech_restraints_vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 
							13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
	var dis_mech_restraints_keys = d3.keys(dis_mech_restraints).slice(0, 26);

	var dis_phys = d3.values(dis_phys_restraints); // physical, disabled
	var dis_phys_restraints_vals = _.map(dis_phys, function(num) { return num*100; });
	var dis_phys_restraints_keys = d3.keys(dis_phys_restraints);

	
	// var dis_seclusions = d3.values(dis_seclusions); // seclusions, disabled
	var dis_seclusions_vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 
							13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
	var dis_seclusions_keys = d3.keys(dis_mech_restraints).slice(0, 26);	

	// var no_dis_mech_restraints_vals = d3.values(no_dis_mech_restraints); // mechanical, not disabled
	var no_dis_mech_restraints_vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 
							13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
	var no_dis_mech_restraints_keys = d3.keys(no_dis_mech_restraints).slice(0, 26);

	var no_dis_phys = d3.values(no_dis_phys_restraints); // physical, not disabled
	var no_dis_phys_restraints_vals = _.map(no_dis_phys, function(num) { return num*100; });
	var no_dis_phys_restraints_keys = d3.keys(no_dis_phys_restraints);

	// var no_dis_seclusions_vals = d3.values(no_dis_seclusions); // seclusions, not disabled
	var no_dis_seclusions_vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 
							13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
	var no_dis_seclusions_keys = d3.keys(no_dis_seclusions).slice(0, 26);


	// HIST #1a: MECHANICAL, DISABLED
	x0.domain(dis_mech_restraints_vals.map( function(d, i) { return i; } ));
	y0.domain( [0, Math.ceil(d3.max(dis_mech_restraints_vals))] );
	
	// append xAxis
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + subHeight + ")")
			.call(xAxis0);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.call(yAxis0)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Mechanical (Disabled)");

	// append bars
	svg.selectAll("bar")
			.data(dis_mech_restraints_vals)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return x0(i); })
			.attr("width", x0.rangeBand())
			.attr("y", function(d) { return y0(d); })
			.attr("height", function(d) { return subHeight - y0(d); })
			.on("mouseover", function(d, i) {
				div.transition()
					.duration(200)
					.style("opacity", 0.9);
				div.html(dis_mech_restraints_keys[i] + "<br/>" + dis_mech_restraints_vals[i].toFixed(2) + "%")
					.style("left", (d3.event.pageX - 37.5) + "px")
					.style("top", (d3.event.pageY - 60) + "px");
			})
			.on("mouseout", function(d) {
				div.transition()
					.duration(500)
					.style("opacity", 0);
			});


	// HIST #1b: PHYSICAL, DISABLED
	var dis_phys_restraints_vals_NZ = [];
	var dis_phys_restraints_keys_NZ = [];
	dis_phys_restraints_vals.forEach(function(d, i) {
		if (d != 0) {
			dis_phys_restraints_vals_NZ.push(d);
			dis_phys_restraints_keys_NZ.push(dis_phys_restraints_keys[i]);
		}
	});

	x1.domain(dis_phys_restraints_vals_NZ.map( function(d, i) { return i; } ));
	// y1.domain( [0, Math.ceil(d3.max(dis_phys_restraints_vals))] );
	y1.domain( [0, 1] );


	// append xAxis
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + (50 + subWidth) + "," + subHeight + ")")
			.call(xAxis1);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (50 + subWidth) + ",0)")
			.call(yAxis1)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Physical (Disabled)");


	svg.selectAll("bar")
			.data(dis_phys_restraints_vals_NZ)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { 
				console.log("x(i) = " + x1(i));
				console.log(50 + subWidth + x1(i)); 
				return 50 + subWidth + x1(i); 
			})
			.attr("width", x1.rangeBand())
			.attr("y", function(d) { return y1(d); })
			.attr("height", function(d) { return subHeight - y1(d); })
			.on("mouseover", function(d, i) {
				div.transition()
					.duration(200)
					.style("opacity", 0.9);
				div.html(dis_phys_restraints_keys_NZ[i] + "<br/>" + dis_phys_restraints_vals_NZ[i].toFixed(2) + "%")
					.style("left", (d3.event.pageX - 37.5) + "px")
					.style("top", (d3.event.pageY - 60) + "px");
			})
			.on("mouseout", function(d) {
				div.transition()
					.duration(500)
					.style("opacity", 0);
			});


	// HIST #1c: SECLUSIONS, DISABLED
	x2.domain(dis_seclusions_vals.map( function(d, i) { return i; } ));
	y2.domain( [0, Math.ceil(d3.max(dis_seclusions_vals))] );

	// append xAxis
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + (100 + 2*subWidth) + "," + subHeight + ")")
			.call(xAxis2);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (100 + 2*subWidth) + ",0)")
			.call(yAxis2)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Seclusions (Disabled)");

	svg.selectAll("bar")
		.data(dis_seclusions_vals)
	.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d, i) { return 100 + 2*subWidth + x2(i); })
		.attr("width", x2.rangeBand())
		.attr("y", function(d) { return y2(d); })
		.attr("height", function(d) { return subHeight - y2(d); })
		.on("mouseover", function(d, i) {
			div.transition()
				.duration(200)
				.style("opacity", 0.9);
			div.html(dis_seclusions_keys[i] + "<br/>" + dis_seclusions_vals[i].toFixed(2) + "%")
				.style("left", (d3.event.pageX - 37.5) + "px")
				.style("top", (d3.event.pageY - 60) + "px");
		})
		.on("mouseout", function(d) {
			div.transition()
				.duration(500)
				.style("opacity", 0);
		});


	// HIST #2a: MECHANICAL, NOT DISABLED
	x3.domain(no_dis_mech_restraints_vals.map( function(d, i) { return i; } ));
	y3.domain( [0, Math.ceil(d3.max(no_dis_mech_restraints_vals))] );
	
	// append xAxis
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (50 + 2*subHeight) + ")")
			.call(xAxis3);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.call(yAxis3)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -(50+subHeight))
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Mechanical (Not Disabled)");

	// append bars
	svg.selectAll("bar")
			.data(no_dis_mech_restraints_vals)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return x3(i); })
			.attr("width", x3.rangeBand())
			.attr("y", function(d) { return y3(d); })
			.attr("height", function(d) { return (50 + 2*subHeight) - y3(d); })
			.style("fill", "SlateBlue")
			.on("mouseover", function(d, i) {
				d3.select(this).style("fill", "gold");
				div.transition()
					.duration(200)
					.style("opacity", 0.9);
				div.html(no_dis_mech_restraints_keys[i] + "<br/>" + no_dis_mech_restraints_vals[i].toFixed(2) + "%")
					.style("left", (d3.event.pageX - 37.5) + "px")
					.style("top", (d3.event.pageY - 60) + "px");
			})
			.on("mouseout", function(d) {
				d3.select(this).style("fill", "SlateBlue")
				div.transition()
					.duration(500)
					.style("opacity", 0);
			});


	// HIST #2b: PHYSICAL, NOT DISABLED
	x4.domain(dis_phys_restraints_vals.map( function(d, i) { return i; } ));
	y4.domain( [0, Math.ceil(d3.max(no_dis_phys_restraints_vals))] );
	
	// append xAxis
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + (50 + subWidth) + "," + (50 + 2*subHeight) + ")")
			.call(xAxis4);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (50 + subWidth) + ",0)")
			.call(yAxis4)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -(50+subHeight))
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Physical (Not Disabled)");

	// append bars
	svg.selectAll("bar")
			.data(no_dis_phys_restraints_vals)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return 50 + subWidth + x4(i); })
			.attr("width", x4.rangeBand())
			.attr("y", function(d) { return y4(d); })
			.attr("height", function(d) { return (50 + 2*subHeight) - y4(d); })
			.style("fill", "SlateBlue")
			.on("mouseover", function(d, i) {
				d3.select(this).style("fill", "gold");
				div.transition()
					.duration(200)
					.style("opacity", 0.9);
				div.html(no_dis_phys_restraints_keys[i] + "<br/>" + no_dis_phys_restraints_vals[i].toFixed(2) + "%")
					.style("left", (d3.event.pageX - 37.5) + "px")
					.style("top", (d3.event.pageY - 60) + "px");
			})
			.on("mouseout", function(d) {
				d3.select(this).style("fill", "SlateBlue");
				div.transition()
					.duration(500)
					.style("opacity", 0);
			});



	// HIST #2c: SECLUSIONS, NOT DISABLED
	x5.domain(no_dis_seclusions_vals.map( function(d, i) { return i; } ));
	y5.domain( [0, Math.ceil(d3.max(no_dis_seclusions_vals))] );
	
	// append xAxis
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + (100 + 2*subWidth) + "," + (50 + 2*subHeight) + ")")
			.call(xAxis5);

	// append yAxis
	svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (100 + 2*subWidth) + ",0)")
			.call(yAxis5)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -(50+subHeight))
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Seclusions (Not Disabled)");

	// append bars
	svg.selectAll("bar")
			.data(no_dis_seclusions_vals)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return 100 + 2*subWidth + x5(i); })
			.attr("width", x5.rangeBand())
			.attr("y", function(d) { return y5(d); })
			.attr("height", function(d) { return (50 + 2*subHeight) - y5(d); })
			.style("fill", "SlateBlue")
			.on("mouseover", function(d, i) {
				d3.select(this).style("fill", "gold");
				div.transition()
					.duration(200)
					.style("opacity", 0.9);
				div.html(no_dis_seclusions_keys[i] + "<br/>" + no_dis_seclusions_vals[i].toFixed(2) + "%")
					.style("left", (d3.event.pageX - 37.5) + "px")
					.style("top", (d3.event.pageY - 60) + "px");
			})
			.on("mouseout", function(d) {
				d3.select(this).style("fill", "SlateBlue");
				div.transition()
					.duration(500)
					.style("opacity", 0);
			});



	//////////////////////////////////////////////////
	// 3. create table for searched school
	/////////////////////////////////////////////////

	var table_title = main_school_obj.School_name;

	// create table
	// var table = d3.select("body").append("table")
});




