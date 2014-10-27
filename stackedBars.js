var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal().range(['red', 'gold']);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var state = "CO";
var pathname = "data/" + state + ".csv";

d3.csv(pathname, function(error, stateData) {

	// get data
	var mech_data = getSeclRest(stateData, "mech");
	var mech_vals = d3.values(mech_data);
	color.domain(["disabled", "not disabled"]);
	console.log("mech_vals");
	console.log(mech_vals);

	mech_vals.forEach(function(d) {

		// console.log(d);
		var y0 = 0;
		d.punish_types = color.domain().map(function(name, i) {
			return { name:name, y0:y0, y1:y0 += +d[i] };
		});
	
		d.total = d.punish_types[d.punish_types.length - 1].y1;

	});

	mech_vals.sort(function(a, b) { 
		return b.total - a.total; 
	});

	x.domain(mech_vals.map(function(d) { return d.School_name; }));
	y.domain([0, d3.max(mech_vals, function(d) { return d.total; })]);

	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

	svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Mechnanical Restraints");

	var pt = svg.selectAll(".punish_type")
			.data(mech_vals)
		.enter().append("g")
			.attr("class", "g")
			.attr("transform", function(d) {
				console.log( "x(d.School_name): " + x(d.School_name) ); 
				return "translate(" + x(d.School_name) + ",0)";
			});

	// pt.selectAll("rect")
	// 		.data(function(d) { return d.punish_type; })
	// 	.enter().append("rect")
	// 		.attr("width", x.rangeBand())
	// 		.attr("y", function(d) { return y(d.y1); })
	// 		.attr("height", function(d) { return y(d.y0) - y(d.y1); })
	// 		.style("fill", function(d) { return color(d.name); });


});







// get punishment data
function getSeclRest(data, punishment_type) {
	
	var alldata = [];

	data.forEach(function(d, i) {	

		var TE = parseInt(d.total_enrollment); // total enrollment
	
		if (punishment_type == "mech") {
			
			var sum_dis = parseInt(d.idea_mech_restraints) + parseInt(d.section_504_mech_restraints);
			var dis_percent = sum_dis/TE;
			var no_dis_percent = parseInt(d.no_dis_mech_restraints)/TE;

			if ((sum_dis != 0 && dis_percent <=1 ) || (no_dis_percent != 0 && no_dis_percent <= 1)) {
				alldata[i] = [dis_percent, no_dis_percent];
				alldata[i].School_name = d.School_name;
			}

		}
		else if (punishment_type == "phys") {

			var sum_dis = parseInt(d.idea_phys_restraints) + parseInt(d.section_504_phys_restraints);
			var dis_percent = sum_dis/TE;
			var no_dis_percent = parseInt(d.no_dis_phys_restraints)/TE;

			if ((sum_dis != 0 && dis_percent <=1 ) || (no_dis_percent != 0 && no_dis_percent <= 1)) {
				// alldata[d.School_name] = [dis_percent, no_dis_percent];
				alldata[i] = [dis_percent, no_dis_percent];
				alldata[i].School_name = d.School_name;
			}	

		}
		else {

			var sum_dis = parseInt(d.idea_seclusion) + parseInt(d.section_504_seclusion);
			var dis_percent = sum_dis/TE;
			var no_dis_percent = parseInt(d.no_dis_seclusion)/TE;

			if ((sum_dis != 0 && dis_percent <=1 ) || (no_dis_percent != 0 && no_dis_percent <= 1)) {
				// alldata[d.School_name] = [dis_percent, no_dis_percent];
				alldata[i] = [dis_percent, no_dis_percent];
				alldata[i].School_name = d.School_name;
			}	
					
		}

	});

	return alldata;	
}