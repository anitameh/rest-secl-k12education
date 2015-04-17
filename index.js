/**
 * @author: Anita Mehrotra
 * @date: March 26, 2015
 * @version: 4.0
*/

// init variables
var margin = {
	top: 50, 
	right: 50, 
	bottom: 50,
	left: 50
};

var width = 960,
	height = 550;

var svg = d3.select('body').append('svg')
			.attr('width', width)
			.attr('height', height);

var projection = d3.geo.albersUsa()
	.scale(600)
	.translate([width/4, height/4]);

var path = d3.geo.path().projection(projection);

// global vars
var query,
	flag = 0, 
	columnNames = ['School', 'Total Enrollment', 'Mechanical, Disabled', 'Seclusions, Disabled', 
		'Physical, Disabled', 'Mechanical, Not Disabled', 'Physical, Not Disabled', 'Seclusions, Not Disabled'];


// load data and execute
d3.json('data/us-named.json', function(error, usa) {

	// draw map
	var usaMap = topojson.feature( usa, usa.objects.states ).features;

	svg.append('g')
			.attr('id', 'states')
		.selectAll('path').data(usaMap)
		.enter().append('path')
			.attr('d', path)
			.on('click', chooseState);

	svg.append('g').append('path')
		.datum(topojson.mesh(usa, usa.objects.states, function(a,b) { return a !== b; }))
		.attr('id', 'state-borders')
		.attr('d', path);

});

document.querySelector('#search-button').addEventListener('click', changeInput);
document.querySelector('#reset-button').addEventListener('click', clearInput);


// FUNCTIONS

// function: choose state
function chooseState(d) {

	// clear search box if new state is selected & set query to undef
	document.querySelector('#search-box').value = ''; 
	query = undefined;

	// change state color
	d3.select('.active').classed('active', false);
	d3.select(this).classed('active', true);

	// remove old state name & "no data" msg
	d3.select('body').selectAll('h1').remove();
	d3.select('body').selectAll('h2').remove();

	// get updated state name
	var actualStateName = d.properties.name;
	d3.select('body').append('h1')
		.style('opacity', 0) // before transition
		.transition()
			.delay(100)
			.duration(750)
			.style('opacity', 1)
			.text( actualStateName ); // end of transition state

	// create table
	var state = d.properties.code;
	var pathname = 'data/' + state + '.csv';
	d3.csv( pathname, function(error, data) {
		var stateData = computeStateMetrics(data); // compute metrics
		buildTableForSchool( stateData, query ); // build table
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
		var mechDisabled = (mechRestraints_idea + mechRestraints_504) / totalEnroll;
		var mechRegular = mechRestraints_reg / totalEnroll;
		var physDisabled = (physRestraints_idea + physRestraints_504) / totalEnroll;
		var physRegular = physRestraints_reg / totalEnroll;
		var seclDisabled = (seclusions_idea + seclusions_504) / totalEnroll;
		var seclRegular = seclusions_reg / totalEnroll;

		// return only if percentages exist AND are in [0,1]
		if ( (mechDisabled != 0 || mechRegular != 0 || physDisabled != 0 || physRegular != 0 || seclDisabled != 0 || seclRegular != 0) &&
			(mechDisabled <= 1 && mechRegular <= 1 && physDisabled <= 1 && physRegular <= 1  && seclDisabled <= 1 && seclRegular <= 1) ) {

			// trim decimals
			if (mechDisabled != 0) {
				mechDisabled = parseFloat(mechDisabled).toFixed(4);
			}
			if (mechRegular != 0) {
				mechRegular = parseFloat(mechRegular).toFixed(4);
			}

			if (physDisabled != 0) {
				physDisabled = parseFloat(physDisabled).toFixed(4);
			}
			if (physRegular != 0) {
				physRegular = parseFloat(physRegular).toFixed(4);
			}

			if (seclDisabled != 0) {
				seclDisabled = parseFloat(seclDisabled).toFixed(4);
			}
			if (seclRegular != 0) {
				seclRegular = parseFloat(seclRegular).toFixed(4);
			}

			allData[ j ] = [d.School_name, totalEnroll, mechDisabled, mechRegular, physDisabled, physRegular, seclDisabled, seclRegular ];
			j = j+1;
		}
	});
	return allData;	
}


// function: search for school
function buildTableForSchool( stateData, schoolQuery ) {

	// remove existing table
	d3.select('body').selectAll('table').remove();

	if ( String(schoolQuery) === 'undefined' ) {
		if ( String(stateData) === 'undefined' ) {
			// If schoolQuery and stateData undefined, 
			// 	get state name and show whole state's data
			var stateName = d3.select('body').select('h1')[0][0]['innerText'];
			var stateAbbreviation = abbrState( stateName, 'abbr');
			var pathname = 'data/' + stateAbbreviation + '.csv';
			d3.csv( pathname, function(error, data) {
				var computedStateData = computeStateMetrics( data );
				buildTable( computedStateData );
			}); 
		}
		else {
			// If schoolQuery undefined and stateData defined, 
			// 	show whole state's data
			buildTable( stateData );
		}
	}
	else {
		if ( String(stateData) === 'undefined' ) {
			var stateOnScreen = d3.select('body').select('h1')[0][0];
			if (stateOnScreen === null) {
				// If schoolQuery defined, stateData undefined AND no state selected,
				//  show msg to select state first
				var noStateMessage = d3.select('body').append('h2');
				noStateMessage.html( 'Please select a state first!' );
			}
			else {
				// If schoolQuery defined and stateData undefined but state selected,
				// 	show school's data for that state
				var stateName = stateOnScreen['innerText'];
				var stateAbbreviation = abbrState( stateName, 'abbr');
				var pathname = 'data/' + stateAbbreviation + '.csv';
				// filter by school
				d3.csv( pathname, function(error, data) {
					var schoolIndex = [],
						schoolsData = [];
					schools = getSchoolNames( data ); 
					schools.forEach( function(d, i) {
						if (d.search( query ) != -1) {
							schoolIndex.push( i );
						}
					});
					// recreate a smaller version of stateData for schools & build table
					schoolIndex.forEach( function(d, j) {
						schoolsData[j] = data[ schoolIndex[j] ];
					});
					// build table
					var computedSchoolsData = computeStateMetrics( schoolsData );
					buildTable( computedSchoolsData );
				}); 
			}
		}
		else {
			// If schoolQuery and stateData defined, 
			//	show school's data for that state
			d3.csv( pathname, function(error, data) {
				var schoolIndex = [],
					schoolsData = [];
				// get school names
				schools = getSchoolNames( data ); 
				schools.forEach( function(d, i) {
					if (d.search( query ) != -1) {
						schoolIndex.push( i );
					}
				});
				// recreate a smaller version of stateData for schools & build table
				schoolIndex.forEach( function(d, j) {
					schoolsData[j] = data[ schoolIndex[j] ];
				});
				// build table
				var computedSchoolsData = computeStateMetrics( schoolsData );
				buildTable( computedSchoolsData );
				buildTable( computedStateData );
			}); 
		}
	}
}


// function: build table
function buildTable(data) {

	if (data.length != 0) {
		// If there's data, init table + headers + body
		var table = d3.select('.table-container')
				.style('overflow', 'scroll')
				.append('table'),
			thead = table.append('thead'),
			tbody = table.append('tbody');

		// rows 
		// append names to header row
		var theaders = thead.selectAll('th')
			.data( columnNames )
			.enter()
			.append('th')
				.text( function(eachcolumnName) { return eachcolumnName; });

		// create rows of table
		var rows = tbody.selectAll('tr')
			.data(data)
			.enter().append('tr');

		// cells
		// update cells of row with text
		var cells = rows.selectAll('td')
			.data( function( row ) {
				return columnNames.map( function(name, i) {
					return {name:name, value:row[i]};
				});
			})
			.enter()
			.append('td')
				.text(function(d) { return d.value; });
		// // animate (fade in)
		// cells
		// 	.style('opacity', 0)
		// 	.transition()
		// 		.delay(100)
		// 		.duration(500)
		// 		.style('opacity', 1);
	}
	else {
		var noDataMessage = 'No data to display. Select a different state or school.';
		d3.select('body').append('h2')
			.style('opacity', 0)
			.transition()
				.delay(100)
				.duration(750)
				.style('opacity', 1)
				.text( noDataMessage );
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


// function: handle input in search box
function changeInput(e) {
	var text = document.querySelector('#search-box').value;
    query = (text.trim()).toUpperCase();
    // now that we have the query, change table to filter and only include query results
    stateData = undefined;
    buildTableForSchool( stateData, query );
}


// function: clears & displays entire state table
function clearInput(e) {
	document.querySelector('#search-box').value = ''; // delete text in search box
	// show table for entire state
	stateData = undefined;
	query = undefined;
	buildTableForSchool( stateData, query );
}


// function: convert state name to/from abbreviation
function abbrState(input, to){
    
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




