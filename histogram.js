
function renderHistogram( rows, col )
{

  // A formatter with commas and no decimal
  var commasFormatter = d3.format(",.0f");

  var margin = {top: 10, right: 30, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;


  // fixme: Get rid of fixed constant 300K!
  var x = d3.scale.linear()
    .domain([0, 300000])
    .range([0, width]);

  // Generate a histogram using twenty uniformly-spaced bins.
  var data = d3.layout.histogram()
      .bins(x.ticks(25))
      .value( function(r) { return r[ col ]; })
      (rows);

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat( function(d) { return "$" + commasFormatter(d); });

  var xTickVals = x.ticks();

  // FIXME: Get rid of fixed constant!
  xTickVals[ xTickVals.length - 1 ] = 290000;

  xAxis.tickValues( xTickVals );

  // Set outer tick size to 0 since
  // last element in in histogram has
  // slightly different interpretation (all items >= last tick value)
  xAxis.outerTickSize(0);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .innerTickSize( -1*width )
      .outerTickSize( 0 );


  var svg = d3.select("#chart0").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("dy", ".71em")
      .attr("x", -1 * height/2 + margin.bottom)
      .style("text-anchor", "end")
      .text("Employee Count");  

  var bar = svg.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
      .on("mouseover", function(d) {
        console.log( "mouseover: x: ", d.x, "y: ", d.y, "length: ", d.length );
      })
      .on("mouseout", function(d) {
        console.log( "mouseout: x: ", d.x );
      })      ;

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(data[0].dx) - 1)
      .attr("height", function(d) { return height - y(d.y); });

  bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", x(data[0].dx) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { return commasFormatter(d.y); });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // let's render the quantiles:
  var rawVals = rows.map( function(r) { return r[ col ]; } );
  rawVals.sort( d3.ascending );

  var mean = d3.mean( rawVals );
  console.log( "mean: $", commasFormatter( mean ) );

  var median = d3.median( rawVals );
  console.log( "median: $", commasFormatter( median ) );

  var mdiv = d3.select("#chartgroup0").append("div")
  	.attr("class", "g-annotation")
  	.attr("style", "top:-250px;left:" + x(median) * 0.35 + "px");

  mdiv.append("div")
  	.attr("class", "g-annotation-content")
  	.attr("style", "width:90px")
  	.text("Median " + col + ": $" + commasFormatter( median ) );

 var mlx2 = x(median) - ( x(median) * 0.35 + 98 ) + 39;
 var mly2 = 40;

  mdiv.append("svg")
  	.attr("class", "g-annotation-pointer")
  	.attr("style", "position:relative;top:-18px;left:98px")
    .attr("width", mlx2 )
    .attr("height", mly2 )
  	.append("line")
  		.attr("x2", mlx2)
  		.attr("y2", mly2);


  svg.append("g")
    .attr("class", "median-line")
    .attr("transform", "translate(" + x( median ) + ", " + ( .6 * height + 6  ) + " )" )
    .append("line")
    .attr("y2", .4 * height  )
    .attr("x2","0");

};

