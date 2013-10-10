
// get summary stats for the specified measure columns:
// for now just uses mean; TODO: make metric func a parameter
function rollupMean( rows, measures ) {
  res = {};

  measures.forEach( function( m ) {
	  var rawVals = rows.map( function(r) { return r[ m ]; } );
	  rawVals.sort( d3.ascending );
	  var mean = d3.mean( rawVals );
	  res[ m ] = mean 
  } );

  return res;
}

function summarize( rows, measures ) {

	function rollupFunc( vals ) {
		var ret = rollupMean( vals, measures );
		ret.count = vals.length;

		return ret;
	}

	var res = 
	  d3.nest()
	    .key(function(r) { return r["Job Family"]; } )
	    .rollup( rollupFunc )
	    .entries( rows );
    return res;
}

function renderVis( rows ) {
  var measures = [ "Base", "OT", "Other", "MDV", "ER", "EE", "DC", "Misc", "TCOE" ]; 

  var jfs = d3.set();
  rows.forEach( function( row ) {
  	jfs.add( row[ "Job Family"] );
  });
  var jfVals = jfs.values();
  jfVals.sort( d3.ascending );
  console.log( "Job Families: ", jfVals );

  var meanAll = rollupMean( rows, measures );
  console.log( "Mean of all measure for all employees", meanAll );

  renderHistogram( rows, "TCOE" );
  var summary = summarize( rows, measures );

  console.log( "Summary stats: ", summary );

  var dpyMeasures = measures.slice( 0, measures.length - 1 );	// drop TCOE

  stackedBarChart( "#compByJobFamily", summary, dpyMeasures );
};


d3.csv("bart-comp-all.csv")
    /* .row(function(d) { return {name: d.Name, title: d.Title, tc: +d["TCOE"]}; }) */
    .get(function(error, rows) { renderVis( rows ); } );
