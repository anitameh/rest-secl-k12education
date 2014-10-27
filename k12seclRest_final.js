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
			.attr("d", path)
			.on("click", clicked);

	svg.append("g").append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a,b) { return a !== b; }))	
		.attr("id", "state-borders")
		.attr("d", path);

});

function clicked(d) {
	// change state color
	d3.select(".active").classed("active", false)
	d3.select(this).classed("active", true)

	// remove old table
	d3.select("body").selectAll("table")
		.remove();
	
	// get state data
	var state = d.properties.code;
	var pathname = "data/" + state + ".csv";
	
	d3.csv(pathname, function(error, data) {
		var stateData = getSeclRest(data); // get punishment data
		var myTable = makeTable(stateData); // make table
		
	});
}

function getSeclRest(data) {
	var alldata = [];
	var j = 0;
	data.forEach(function(d) {
		var TE = parseInt(d.total_enrollment);
		var mech_dis = ( parseInt(d.idea_mech_restraints) + parseInt(d.section_504_mech_restraints) )/TE;
		var mech_no_dis = parseInt(d.no_dis_mech_restraints)/TE;
		var phys_dis = ( parseInt(d.idea_phys_restraints) + parseInt(d.section_504_phys_restraints) )/TE;
		var phys_no_dis = parseInt(d.no_dis_phys_restraints)/TE;
		var secl_dis = ( parseInt(d.idea_seclusion) + parseInt(d.section_504_seclusion) )/TE;
		var secl_no_dis = parseInt(d.no_dis_seclusion)/TE;

		if ( (mech_dis != 0 && mech_dis <= 1) || (mech_no_dis != 0 && mech_no_dis <= 1) &&
			 (phys_dis != 0 && phys_dis <= 1) || (phys_no_dis != 0 && phys_no_dis <= 1) &&
			 (secl_dis != 0 && secl_dis <= 1) || (secl_no_dis != 0 && secl_no_dis <= 1) ) {

			if (mech_dis != 0) { mech_dis = parseFloat(mech_dis).toFixed(3) };
			if (mech_no_dis != 0) { mech_no_dis = parseFloat(mech_no_dis).toFixed(3) };
			if (phys_dis != 0) { phys_dis = parseFloat(phys_dis).toFixed(3) };
			if (phys_no_dis != 0) { phys_no_dis = parseFloat(phys_no_dis).toFixed(3) };
			if (secl_dis != 0) { secl_dis = parseFloat(secl_dis).toFixed(3) };
			if (secl_no_dis != 0) { secl_no_dis = parseFloat(secl_no_dis).toFixed(3) };

			alldata[j] = [d.School_name, TE, mech_dis, mech_no_dis, phys_dis, phys_no_dis, secl_dis, secl_no_dis];
			j = j+1; 

		}
	});
	return alldata;
}

function makeTable(data) {
	var columns = ["School", "Total Enrollment", "Mechanical, Disabled", "Physical, Disabled", "Seclusions, Disabled",
						"Mechanical, Not Disabled", "Physical, Not Disabled", "Seclusions, Not Disabled"];
	
	// console.log(column_names);
	var table = d3.select("body").append("table")
			.style("margin-left", "20px")
			.style("margin-top", "-260px"),
		thead = table.append("thead"),
		tbody = table.append("tbody");

	// append header row
	thead.append("tr")
		.selectAll("th")
		.data(columns)
		.enter()
		.append("th")
			.text(function(column) { return column; })
				.style("font-family", "Impact");

	// create a row for each object in the data
	var rows = tbody.selectAll("tr")
		.data(data)
		.enter()
		.append("tr");

	// create a cell in each row for each column
	var cells = rows.selectAll("td")
		.data(function(row) {
			return columns.map(function(column, i) {
				return {column:column, value:row[i]};
			});
		})
		.enter()
		.append("td")
		.style("font-family", "Tahoma")
		.style("font-size", "9pt")
			.html(function(d) { return d.value; });

	return table;

}