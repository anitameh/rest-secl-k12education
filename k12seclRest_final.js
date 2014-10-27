/**
 * @author: Anita Mehrotra
 * @date: October 27, 2014
 * @version: 3.0
*/

var margin = {
	top: 50, 
	right: 50, 
	bottom: 50,
	left: 50
};

var width = 850,
	height = 750;

var svg = d3.select("body").append("svg")
			.attr("width", width)
			.attr("height", height);


// create US Map
var projection = d3.geo.albersUsa()
	.scale(900)
	.translate([width/2, height-550]);

var path = d3.geo.path().projection(projection);

d3.json("data/us-named.json", function(error, us) {
	
	var usMap = topojson.feature(us, us.objects .states).features;

	svg.append("g")
			.attr("id", "states")
		.selectAll("path")
			.data(usMap)
		.enter().append("path")
			.attr("d", path);
			// .on("click", clicked);

	svg.append("g").append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a,b) { return a !== b; }))	
		.attr("id", "state-borders")
		.attr("d", path);

});
