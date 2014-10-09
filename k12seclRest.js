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


function updateData() {
	console.log("updateData()!")
}
// d3.json("data/us-named.json", function(error, usa) {

// 	if (error) return console.error(error);


// });




