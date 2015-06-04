/**
 * @author: Anita Mehrotra
 * @date: May 26, 2015
 * @version: 5.0
*/

// init variables
var margin = {
	top: 50, 
	right: 50, 
	bottom: 50,
	left: 50
};

var width = 630,
	height = 400;

var svg = d3.select('body').append('svg')
			.attr('width', width)
			.attr('height', height);

var projection = d3.geo.albersUsa()
	.scale(800)
	.translate([340, 220]);

var path = d3.geo.path().projection(projection);

// global vars
var query,
	state,
	table,
	columnNames = ['School', 'Total Enrolled', 'Mechanical, Disabled',
		'Physical, Disabled', 'Seclusions, Disabled', 'Mechanical, Not Disabled',
		'Physical, Not Disabled', 'Seclusions, Not Disabled'];


// load data and execute
d3.json('data/us-named.json', function(error, usa) {

	// draw map
	var usaMap = topojson.feature( usa, usa.objects.states ).features;

	svg.append('g')
			.attr('id', 'states')
		.selectAll('path').data(usaMap)
		.enter().append('path')
			.attr('d', path)
			.attr('class', function(d) {
				if (d.properties.code == 'NY') { // pre-select New York
					return 'active';
				}
			})
			.on('mouseover', function() {
				d3.select(this)
					.attr('fill', 'gold')
					.style('fill-opacity', 0.75);
			})
			.on('mouseout', function() {
				d3.select(this)
					.attr('fill', 'lightslategray')
					.style('fill-opacity', 0.95);
			})
			.on('click', onChooseState);

	svg.append('g').append('path')
		.datum(topojson.mesh(usa, usa.objects.states, function(a,b) { return a !== b; }))
		.attr('id', 'state-borders')
		.attr('d', path);

	// pre-select New York
	// New York header
	d3.select('body').append('h1')
		.style('margin-left', '270px')
		.style('opacity', 0)
		.transition()
			.delay(100)
			.duration(750)
			.style('opacity', 1)
			.text('NEW YORK');

	// New York table
	state = 'NY';
	var pathname = 'data/NY.csv';
	d3.csv(pathname, function(error, data) {
		var stateData = computeStateMetrics(data);
		buildTable(stateData);
	});

});


// function: change New York's state color
function changeNYColor(d) {
	var value = d.properties.value;
	console.log(value);
	return 'purple';
}


// function: choose state
function onChooseState(d) {

	// change state color
	d3.select('.active').classed('active', false);
	d3.select(this).classed('active', true);

	// remove old state name, "no data" message, and old table
	d3.select('h1').remove();
	d3.select('h2').remove();

	// create new state name title
	var actualStateName = d.properties.name;
	d3.select('body').append('h1')
		.style('margin-left', width/2.5 - actualStateName.length*3 + 'px') // position
		.style('opacity', 0) // before transition
		.transition()
			.delay(100)
			.duration(750)
			.style('opacity', 1)
			.text(actualStateName.toUpperCase());

	state = d.properties.code; // get currently clicked state

	// create new table
	var pathname = 'data/' + state + '.csv';
	d3.csv( pathname, function(error, data) {
		var stateData = computeStateMetrics(data); // compute metrics
		buildTable(stateData);
	});
}


// function: compute state metrics
function computeStateMetrics(data) {
	// init
	allData = [];
	var j = 0;

	data.forEach( function(d) {
		// get metrics
		var totalEnroll = parseInt( d.total_enrollment );
		var mechRestraints_idea = parseInt( d.idea_mech_restraints );
		var mechRestraints_504 = parseInt( d.section_504_mech_restraints );
		var mechRestraints_reg = parseInt( d.no_dis_mech_restraints );
		var physRestraints_idea = parseInt( d.idea_phys_restraints );
		var physRestraints_504 = parseInt( d.section_504_phys_restraints );
		var physRestraints_reg = parseInt( d.no_dis_phys_restraints );
		var seclusions_idea = parseInt( d.idea_seclusion );
		var seclusions_504 = parseInt( d.section_504_seclusion );
		var seclusions_reg = parseInt( d.no_dis_seclusion );

		// compute percentages
		var mechDisabled = ((mechRestraints_idea + mechRestraints_504) / totalEnroll)*100;
		var mechRegular = (mechRestraints_reg / totalEnroll)*100;
		var physDisabled = ((physRestraints_idea + physRestraints_504) / totalEnroll)*100;
		var physRegular = (physRestraints_reg / totalEnroll)*100;
		var seclDisabled = ((seclusions_idea + seclusions_504) / totalEnroll)*100;
		var seclRegular = (seclusions_reg / totalEnroll)*100;

		// return only if percentages exist AND are in [0,1]
		if ( (mechDisabled != 0 || mechRegular != 0 || physDisabled != 0 || physRegular != 0 || seclDisabled != 0 || seclRegular != 0) &&
			(mechDisabled <= 1 && mechRegular <= 1 && physDisabled <= 1 && physRegular <= 1  && seclDisabled <= 1 && seclRegular <= 1) ) {

			// trim decimals
			if (mechDisabled != 0) {
				mechDisabled = String(parseFloat(mechDisabled).toFixed(3)) + '%';
			}
			if (mechRegular != 0) {
				mechRegular = String(parseFloat(mechRegular).toFixed(3)) + '%';
			}
			if (physDisabled != 0) {
				physDisabled = String(parseFloat(physDisabled).toFixed(3)) + '%';
			}
			if (physRegular != 0) {
				physRegular = String(parseFloat(physRegular).toFixed(3)) + '%';
			}
			if (seclDisabled != 0) {
				seclDisabled = String(parseFloat(seclDisabled).toFixed(3)) + '%';
			}
			if (seclRegular != 0) {
				seclRegular = String(parseFloat(seclRegular).toFixed(3)) + '%';
			}

			allData[ j ] = [d.School_name, totalEnroll, mechDisabled, physDisabled, seclDisabled, mechRegular, physRegular, seclRegular ];
			j = j+1;
		}
	});
	return allData;	
}


// function: build table using DataTables
function buildTable(data) {

	if (data.length != 0) {

		// If there's data, create table
		$(document).ready(function() {
			$('#demo').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');

			table = $('#example').DataTable({
				'data': data,
				'columns': [
					{'title': columnNames[0]}, 
					{'title': columnNames[1]},
					{'title': columnNames[2]},
					{'title': columnNames[3]},
					{'title': columnNames[4]},
					{'title': columnNames[5]},
					{'title': columnNames[6]},
					{'title': columnNames[7]}
				],
				'scrollY': '300px',
				'scrollCollapse': true,
				'paging': false,
				'info': false, 
				'retrieve': true
			});
			table.rows().clear();
			table.rows.add(data);
			table.draw();
		});

		$('.dataTables_filter input')
			.attr('placeholder', "Type your school's name here");

		// $('#example').css('display', 'inline');

	}
	else {
		if (String(table) === 'undefined') {
			var noDataMessage = 'There is no data available for this state or school.';
			d3.select('body').append('h2')
				.style('opacity', 0)
				.transition()
					.delay(100)
					.duration(750)
					.style('opacity', 1)
					.text( noDataMessage );
		}
		else {
			table.rows().clear().draw();  // if a table DOES exist, display empty table
		}
	}
}


// function: get school names
function getSchoolNames( data ) {
	schools = [];
	data.forEach( function(d, i) {
		schools.push( d['School_name'] );
	});
	return schools;
}


// function: convert state name to/from abbreviation 
// (c/o: Caleb Grove - https://gist.github.com/CalebGrove)
function abbrState(input, to) {
	var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() 
        	+ txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }    
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }    
    }
}
