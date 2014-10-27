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

	// remove old title
	d3.select("body").selectAll("h1")
		.remove();
	
	// get state data
	var state = d.properties.code;
	var pathname = "data/" + state + ".csv";

	// append title
	var mytitle = d3.select("body").append("h1");
	mytitle.html(d.properties.name);
	
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
	var school_name_ascending_bool = true;
	var enroll_ascending_bool = true;
	var mech_dis_ascending_bool = true;
	var phys_dis_ascending_bool = true;
	var secl_dis_ascending_bool = true;
	var mech_no_dis_ascending_bool = true;
	var phys_no_dis_ascending_bool = true;
	var secl_no_dis_ascending_bool = true;
	
	// console.log(column_names);
	var table = d3.select("body").append("table")
			.style("margin-left", "20px")
			.style("margin-top", "-260px"),
		thead = table.append("thead"),
		tbody = table.append("tbody");

	// append header row and sort
	thead.append("tr")
		.selectAll("th")
		.data(columns)
		.enter().append("th")
			.text(function(column) { return column; })
				.style("font-family", "Impact")
		.on("click", function(d, i) {
			var sort;
			if (i == 0) {
				// school name
				if (school_name_ascending_bool) {
					sort = sort_school_name_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_school_name_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				school_name_ascending_bool = !school_name_ascending_bool;
			}
			else if (i == 1) {
				// total enrollment
				if (enroll_ascending_bool) {
					sort = sort_enroll_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_enroll_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				enroll_ascending_bool = !enroll_ascending_bool;
			}
			else if (i == 2) {
				// mechanical, disabled
				if (mech_dis_ascending_bool) {
					sort = sort_mech_dis_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_mech_dis_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				mech_dis_ascending_bool = !mech_dis_ascending_bool;
			}
			else if (i == 3) { 
				// physical, disabled
				if (phys_dis_ascending_bool) {
					sort = sort_phys_dis_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_phys_dis_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				phys_dis_ascending_bool = !phys_dis_ascending_bool;
			}
			else if (i == 4) { 
				// seclusions, disabled
				if (secl_dis_ascending_bool) {
					sort = sort_secl_dis_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_secl_dis_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				secl_dis_ascending_bool = !secl_dis_ascending_bool;
			}
			else if (i == 5) { 
				// mechanical, not disabled
				if (mech_no_dis_ascending_bool) {
					sort = sort_mech_no_dis_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_mech_no_dis_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				mech_no_dis_ascending_bool = !mech_no_dis_ascending_bool;
			}
			else if (i == 6) { 
				// physical, not disabled
				if (phys_no_dis_ascending_bool) {
					sort = sort_phys_no_dis_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_phys_no_dis_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				phys_no_dis_ascending_bool = !phys_no_dis_ascending_bool;
			}
			else if (i == 7) { 
				// seclusions, disabled
				if (secl_no_dis_ascending_bool) {
					sort = sort_secl_no_dis_ascend;
					d3.selectAll("th").style("cursor", "n-resize");
				}
				else {
					sort = sort_secl_no_dis_descend;
					d3.selectAll("th").style("cursor", "s-resize");
				}
				secl_no_dis_ascending_bool = !secl_no_dis_ascending_bool;
			}

			rows.sort(sort);
		});

	// create a row for each object in the data
	var rows = tbody.selectAll("tr")
		.data(data)
		.enter().append("tr");

	// change color on hover-over
	tbody.selectAll("tr")
		.on("mouseover", function() {
			d3.select(this)
				.style("background-color", "gold")
		})
		.on("mouseout", function() {
			d3.select(this).style("background-color", null);
		});

	// create a cell in each row for each column
	var cells = rows.selectAll("td")
		.data(function(row) {
			return columns.map(function(column, i) {
				return {column:column, value:row[i]};
			});
		})
		.enter().append("td")
		.style("font-family", "Tahoma")
		.style("font-size", "9pt")
			.html(function(d) { return d.value; })
		.attr("class", function(d, i) { return "col_" + i; })
		.on("mouseover", function(d, i) {
			d3.selectAll("td.col_" + i).style("background-color", "gold");
		})
		.on("mouseout", function(d, i) {
			d3.selectAll("td.col_" + i).style("background-color", null);
		});

	return table;

}

var sort_school_name_ascend = function(a, b) { return d3.ascending(a[0], b[0]); };
var sort_school_name_descend = function(a, b) { return d3.descending(a[0], b[0]); };

var sort_enroll_ascend = function(a, b) { return d3.ascending(parseFloat(a[1]), parseFloat(b[1])) || d3.ascending(a[0], b[0]); };
var sort_enroll_descend = function(a, b) { return d3.descending(parseFloat(a[1]), parseFloat(b[1])) || d3.descending(a[0], b[0]); };

var sort_mech_dis_ascend = function(a, b) { return d3.ascending(parseFloat(a[2]), parseFloat(b[2])) || d3.ascending(a[0], b[0]); };
var sort_mech_dis_descend = function(a, b) { return d3.descending(parseFloat(a[2]), parseFloat(b[2])) || d3.descending(a[0], b[0]); };

var sort_phys_dis_ascend = function(a, b) { return d3.ascending(parseFloat(a[3]), parseFloat(b[3])) || d3.ascending(a[0], b[0]); };
var sort_phys_dis_descend = function(a, b) { return d3.descending(parseFloat(a[3]), parseFloat(b[3])) || d3.descending(a[0], b[0]); };

var sort_secl_dis_ascend = function(a, b) { return d3.ascending(parseFloat(a[4]), parseFloat(b[4])) || d3.ascending(a[0], b[0]); };
var sort_secl_dis_descend = function(a, b) { return d3.descending(parseFloat(a[4]), parseFloat(b[4])) || d3.descending(a[0], b[0]); };

var sort_mech_no_dis_ascend = function(a, b) { return d3.ascending(parseFloat(a[5]), parseFloat(b[5])) || d3.ascending(a[0], b[0]); };
var sort_mech_no_dis_descend = function(a, b) { return d3.descending(parseFloat(a[5]), parseFloat(b[5])) || d3.descending(a[0], b[0]); };

var sort_phys_no_dis_ascend = function(a, b) { return d3.ascending(parseFloat(a[6]), parseFloat(b[6])) || d3.ascending(a[0], b[0]); };
var sort_phys_no_dis_descend = function(a, b) { return d3.descending(parseFloat(a[6]), parseFloat(b[6])) || d3.descending(a[0], b[0]); };

var sort_secl_no_dis_ascend = function(a, b) { return d3.ascending(parseFloat(a[7]), parseFloat(b[7])) || d3.ascending(a[0], b[0]); };
var sort_secl_no_dis_descend = function(a, b) { return d3.descending(parseFloat(a[7]), parseFloat(b[7])) || d3.descending(a[0], b[0]); };

