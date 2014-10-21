/**
 * @author: Anita Mehrotra
 * @date: October 14, 2014
 */

var margin = {
 	top: 50,
 	right: 50,
 	bottom: 50,
 	left: 50
};

var width = 750,
	height = 750,
	centered;

// create svg elements for each sub-visualization
var stateVisWidth = 610;
var stateVisHeight = 600;

var subWidth = stateVisWidth - 140,
	subHeight = (stateVisHeight - margin.top)/3.5;

// canvas
var canvas = d3.select("#vis").append("svg").attr({
	width: width - margin.left - margin.right,
	height: height - margin.top - margin.bottom
});

// append smaller canvases a.k.a. svg's to the canvas
var svg = canvas.append("g").attr({
	transform: "translate(" + margin.left + "," + margin.top + ")"
});

var stateVis = d3.select("#stateVis").append("svg").attr({
	width: stateVisWidth,
	height: stateVisHeight
});


// axes
var shiftRight = 50;

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
		.ticks(5);


var x1 = d3.scale.ordinal()
	.rangeRoundBands( [0, subWidth], .1 );

var y1 = d3.scale.linear()
	.range( [50 + 2*subHeight, 50 + subHeight] );

var xAxis1 = d3.svg.axis()
	.scale(x1)
	.tickSize(0, 0)
	.orient("bottom");

xAxis1.tickFormat( function(d) { return ''; });

var yAxis1 = d3.svg.axis()
	.scale(y1)
	.orient("left")
		.ticks(5);


var x2 = d3.scale.ordinal()
	.rangeRoundBands( [0, subWidth], .1 );

var y2 = d3.scale.linear()
	.range( [100 + 3*subHeight, 100 + 2*subHeight] );

var xAxis2 = d3.svg.axis()
	.scale(x2)
	.tickSize(0, 0)
	.orient("bottom");

xAxis2.tickFormat( function(d) { return ''; });

var yAxis2 = d3.svg.axis()
	.scale(y2)
	.orient("left")
		.ticks(5);


// tooltip
var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);


// US map
var projection = d3.geo.albersUsa()
	.scale(800)
	.translate([width-460, height-600]);

var path = d3.geo.path().projection(projection);

// load data
// queue()
// 	.defer(d3.json, "data/us-named.json")
// 	.defer(d3.csv, "data/original-data.csv")
// 	.await(ready);

// function ready(error, us) {
d3.json("data/us-named.json", function(error, us) {
	
	var usMap = topojson.feature(us, us.objects.states).features;

	svg.append("g")
			.attr("id", "states")
		.selectAll("path")
			.data(usMap)
		.enter().append("path")
			.attr("d", path)
			.on("click", clicked);

	svg.append("g").append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a,b) { return a !== b; }))	
		.attr("id", "state-borders")
		.attr("d", path);

});

// initial bar graph
var bars_dis, bars_no_dis;
var state = "CO"; // get data for particular state
createStateVis(state);


function clicked(d) {

	// change state color
	d3.select(".active").classed("active", false);
  	d3.select(this).classed("active", true);

  	// remove old bars/y-axis/legend
  	stateVis.selectAll("rect")
  		.transition()
  		.duration(75)
  		.remove();

  	// bars_dis.exit().transition()
  	// 	.delay(function(d,i) { return i*20; })
  	// 	.duration(300)
  	// 	// .attr("x", function(d,i) { return -400; })
  	// 	// .attr("y", function(d,i) { return -400; })
  	// 	.remove();
  	
  	// bars_no_dis.exit().transition()
  	// 	.delay(function(d,i) { return i*20; })
  	// 	.duration(300)
  	// 	// .attr("x", function(d,i) { return -400; })
  	// 	// .attr("y", function(d,i) { return -400; })
  	// 	.remove();

  	stateVis.selectAll(".y.axis")
  		.transition()
  		.duration(75)
  		.remove();

  	stateVis.selectAll("legend")
  		.transition()
  		.duration(75)
  		.remove();

  	// update
  	var state = d.properties.code;
  	createStateVis(state);

}


// create all three bar graphs
function createStateVis(state) {

	// initialize
	var mech_restraints, phys_restraints, seclusions;
	var pathname = "data/" + state + ".csv";
	
	d3.csv(pathname, function(error, stateData) {
		// get punishment data
		mech_restraints = getSeclRest(stateData, "mech");
		phys_restraints = getSeclRest(stateData, "phys");
		seclusions = getSeclRest(stateData, "seclusion");
	
		// make bar graphs
		makeBarGraph(mech_restraints, 0);
		makeBarGraph(phys_restraints, 1);
		makeBarGraph(seclusions, 2);
	});

	// make legend
	makeLegend();


}


// get punishment data
function getSeclRest(data, punishment_type) {
	
	var alldata = [];

	data.forEach(function(d) {	

		var TE = parseInt(d.total_enrollment); // total enrollment
	
		if (punishment_type == "mech") {
			
			var sum_dis = parseInt(d.idea_mech_restraints) + parseInt(d.section_504_mech_restraints);
			var dis_percent = sum_dis/TE;
			var no_dis_percent = parseInt(d.no_dis_mech_restraints)/TE;

			if ((sum_dis != 0 && dis_percent <=1 ) || (no_dis_percent != 0 && no_dis_percent <= 1)) {
				alldata[d.School_name] = [dis_percent, no_dis_percent];
			}

		}
		else if (punishment_type == "phys") {

			var sum_dis = parseInt(d.idea_phys_restraints) + parseInt(d.section_504_phys_restraints);
			var dis_percent = sum_dis/TE;
			var no_dis_percent = parseInt(d.no_dis_phys_restraints)/TE;

			if ((sum_dis != 0 && dis_percent <=1 ) || (no_dis_percent != 0 && no_dis_percent <= 1)) {
				alldata[d.School_name] = [dis_percent, no_dis_percent];
			}	

		}
		else {

			var sum_dis = parseInt(d.idea_seclusion) + parseInt(d.section_504_seclusion);
			var dis_percent = sum_dis/TE;
			var no_dis_percent = parseInt(d.no_dis_seclusion)/TE;

			if ((sum_dis != 0 && dis_percent <=1 ) || (no_dis_percent != 0 && no_dis_percent <= 1)) {
				alldata[d.School_name] = [dis_percent, no_dis_percent];
			}	
					
		}

	});

	return alldata;	
}

// make bar graph
function makeBarGraph(data, plotNum) {

	// data
	var keys = d3.keys(data);
	var vals = d3.values(data);

	var vals_dis = [];
	var vals_no_dis = [];

	vals.forEach(function(d) {
		vals_dis.push( d[0] );
		vals_no_dis.push( d[1] );
	});

	var percents_dis = _.map(vals_dis, function(num) { return num*100; });
	var percents_no_dis = _.map(vals_no_dis, function(num) { return num*100; });

	////////////////////////////////////////////
	////////////////////////////////////////////
	percents_dis = percents_dis.slice(0,425);
	////////////////// THIS /////////////////////
	percents_no_dis = percents_no_dis.slice(0, 425);
	////////////////////////////////////////////
	////////////////////////////////////////////

	if (plotNum == 0) {
		var x = x0; var y = y0;
		var xAxis = xAxis0; 
		var yAxis = yAxis0;
		var thisHeight = subHeight;
		var label = "Mechanical Restraints";
	}
	else if (plotNum == 1) {
		var x = x1; var y = y1;
		var xAxis = xAxis1;
		var yAxis = yAxis1;
		var thisHeight = 50 + 2*subHeight;
		var label = "Physical Restraints";
	}
	else {
		var x = x2; var y = y2;
		var xAxis = xAxis2;
		var yAxis = yAxis2;
		var thisHeight = 100 + 3*subHeight;
		label = "Seclusions";
	}
	
	// set up domains
	x.domain(percents_dis.map( function(d, i) { return i; } ));

	var max_dis = Math.ceil(d3.max(percents_dis));
	var max_no_dis = Math.ceil(d3.max(percents_no_dis));
	if (max_dis > max_no_dis) {
		y.domain( [0, max_dis] );
	}
	else {
		y.domain( [0, max_no_dis] );
	}

	// append xAxis
	stateVis.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + shiftRight + "," + thisHeight + ")")
		.call(xAxis);

	// append yAxis
	stateVis.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + shiftRight + ",0)")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -(50 + subHeight)*plotNum)
			.attr("y", 5)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(label)
		.transition()
			.delay(100)
			.duration(100);

	// append bars for students with disabilities
	// bars_dis = stateVis.selectAll("bar").data(percents_dis);
	stateVis.selectAll("bar").data(percents_dis)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return x(i)+shiftRight; })
			.attr("width", x.rangeBand())
			.attr("y", function(d) { return y(d); })
			.attr("height", function(d) { return thisHeight - y(d); })
			.on("mouseover", function(d, i) {
				div.transition()
					.duration(200)
					.style("opacity", 0.9);
				div.html(keys[i] + "<br/> <font color='RoyalBlue'>" + percents_dis[i].toFixed(2) + "% </font>")
					.style("left", (d3.event.pageX - 37.5) + "px")
					.style("top", (d3.event.pageY - 60) + "px");
			})
			.on("mouseout", function(d) {
				div.transition()
					.duration(500)
					.style("opacity", 0);
			})
			.transition()
				.delay(function(d,i) { return i*20; } )
				.duration(500);

	// append bars for students without disabilities
	// bars_no_dis = stateVis.selectAll("bar").data(percents_no_dis);
	stateVis.selectAll("bar").data(percents_no_dis)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return x(i) + shiftRight; })
			.attr("width", x.rangeBand())
			.attr("y", function(d) { return y(d); })
			.attr("height", function(d) { return thisHeight - y(d); })
			.style("fill", "gold")
			.style("opacity", 0.75)
			.on("mouseover", function(d, i) {
				d3.select(this).style("fill", "purple");
				div.transition()
					.duration(200)
					.style("opacity", 0.9);
				div.html(keys[i] + "<br/> <font color='purple'>" + percents_no_dis[i].toFixed(2) + "% </font>")
					.style("left", (d3.event.pageX - 37.5) + "px")
					.style("top", (d3.event.pageY - 60) + "px");
			})
			.on("mouseout", function(d) {
				d3.select(this).style("fill", "gold");
				d3.select(this).style("opacity", 0.75);
				div.transition()
					.duration(500)
					.style("opacity", 0);
			})
			.transition()
				.delay(function(d,i) { return i*20; })
				.duration(50);
}

// make legend

function makeLegend() {

	// initialize
	var colors = ["red", "gold"];
	var labels = ["Disabled", "Not Disabled"];

	// make legend
	var legend = stateVis.selectAll("legend")
			.data(colors)
		.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(0," + (i*20) + ")"; });

	legend.append("rect")
			.attr("x", stateVisWidth-20)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", function(d) { return d; });
	
	legend.append("text")
		.attr("x", stateVisWidth-25)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		// .style("font-family", "Charcoal, Impact, sans-serif")
		.text(function(d, i) { return labels[i]; });
}



