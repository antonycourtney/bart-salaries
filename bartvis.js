
// get summary stats for the specified measure columns,
// aggregated using aggFunc
function rollupBy(aggFunc) {
  function af( rows, measures ) {
	  res = {};

	  measures.forEach( function( m ) {
		  var rawVals = rows.map( function(r) { return r[ m ]; } );
		  rawVals.sort( d3.ascending );
		  var agg = aggFunc( rawVals );
		  res[ m ] = agg 
	  } );

	  return res;
	}

  return af;
}

function summarize( rows, measures, rollupFunc ) {

	function rollupAndCount( vals ) {
		var ret = rollupFunc( vals, measures );
		ret.count = vals.length;

		return ret;
	}

	var res = 
	  d3.nest()
	    .key(function(r) { return r["Job Family"]; } )
	    .rollup( rollupAndCount )
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

  var meanAll = rollupBy( d3.mean )( rows, measures );
  console.log( "Mean of all measure for all employees", meanAll );

  renderHistogram( rows, "TCOE" );

  var avgSummary = summarize( rows, measures, rollupBy( d3.mean ) );
  console.log( "Summary stats: ", avgSummary );

  var dpyMeasures = measures.slice( 0, measures.length - 1 );	// drop TCOE

  stackedBarChart( "#AvgComp", avgSummary, dpyMeasures, "Total Cost of Employment (TCOE)" );


  var totalSummary = summarize( rows, measures, rollupBy( d3.sum ) );
  stackedBarChart( "#TotalComp", totalSummary, dpyMeasures, "Total Compensation Expense" );

  console.log( "Total Summary: ", totalSummary );

  dualStackedBarChart( "#DualComp", avgSummary, totalSummary, dpyMeasures, "Total Cost of Employment (TCOE)" );
};


d3.csv("bart-comp-all.csv")
    /* .row(function(d) { return {name: d.Name, title: d.Title, tc: +d["TCOE"]}; }) */
    .get(function(error, rows) { renderVis( rows ); } );
