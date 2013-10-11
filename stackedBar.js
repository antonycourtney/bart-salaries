
function stackedBarChart( parentSelector, data, measures, yaxisLabel )
{
	var margin = {top: 20, right: 50, bottom: 200, left: 60},
	    width = 500 - margin.left - margin.right,
	    height = 450 - margin.top - margin.bottom;
	 
	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);
	 
	var y = d3.scale.linear()
	    .rangeRound([height, 0]);
	 
	var color = d3.scale.ordinal()
	    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	 
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .outerTickSize( 0 )
	    .orient("bottom");
	 
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
      	.innerTickSize( -1*width + 10 )
      	.outerTickSize( 0 )	    
	    .tickFormat( d3.format("$s") );
	 
	var svg = d3.select(parentSelector).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	 
	color.domain(measures);

	data.forEach(function(d) {
		var y0 = 0;
		d.valCoords = color.domain().map(function(name) { return {key: d.key, values: d.values, name: name, y0: y0, y1: y0 += +d.values[name]}; });
		d.total = d.valCoords[d.valCoords.length - 1].y1;
	});

	data.sort(function(a, b) { return b.total - a.total; });

	x.domain(data.map(function(d) { return d.key; }));
	y.domain([0, d3.max(data, function(d) { return d.total; })]);

	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height + ")")
	  .call(xAxis)
	  .selectAll("text")  
	    .style("text-anchor", "end")
	    .attr("dx", "-.8em")
	    .attr("dy", ".15em")
	    .attr("transform", function(d) {
	        return "rotate(-65)" 
	        });


	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -55)
      .attr("dy", ".71em")
      .attr("x", -1 * height + margin.bottom)
      .style("text-anchor", "end")
      .style("font-weight", "bold")
      .text( yaxisLabel );  


	var rect = svg.selectAll("rect")
	  .data(data)
	  .enter().append("g")
	  .attr("class", "g")
	  .attr("transform", function(d) { return "translate(" + x(d.key) + ",0)"; });

  	// Interactive tooltip!
  	var ttdiv = d3.select(parentSelector + " .sb-tooltip");

  	console.log( "ttdiv:", ttdiv );

  	var tttitle = d3.select(parentSelector + " .sb-data-tooltip .sb-tooltip-title" );

  	var tt_tcoe = d3.select(parentSelector + " .tt-tcoe");
  	var tt_base = d3.select(parentSelector + " .tt-base");
  	console.log( "ttbase:", tt_base );
  	var tt_ot = d3.select(parentSelector + " .tt-ot");
  	var tt_other = d3.select(parentSelector + " .tt-other");
  	var tt_mdv = d3.select(parentSelector + " .tt-mdv");
  	var tt_er = d3.select(parentSelector + " .tt-er");
  	var tt_ee = d3.select(parentSelector + " .tt-ee");
  	var tt_dc = d3.select(parentSelector + " .tt-dc");
  	var tt_misc = d3.select(parentSelector + " .tt-misc");
  	var tt_count = d3.select(parentSelector + " .tt-count");

	rect.selectAll("rect")
	  .data(function(d) { return d.valCoords; })
	.enter().append("rect")
	  .attr("width", x.rangeBand())
	  .attr("y", function(d) { return y(d.y1); })
	  .attr("height", function(d) { return y(d.y0) - y(d.y1); })
	  .style("fill", function(d) { return color(d.name); })
	  .on("mouseover", function(d) {   
	  		tttitle.text(d.key);
	  		tt_tcoe.text(d3.format("$,.0f")(d.values.TCOE)); 
	  		tt_base.text(d3.format("$,.0f")(d.values.Base)); 
	  		tt_ot.text(d3.format("$,.0f")(d.values.OT)); 
	  		tt_other.text(d3.format("$,.0f")(d.values.Other)); 
	  		tt_mdv.text(d3.format("$,.0f")(d.values.MDV)); 
	  		tt_er.text(d3.format("$,.0f")(d.values.ER)); 
	  		tt_ee.text(d3.format("$,.0f")(d.values.EE)); 
	  		tt_dc.text(d3.format("$,.0f")(d.values.DC)); 
	  		tt_misc.text(d3.format("$,.0f")(d.values.Misc)); 
	  		tt_count.text(d3.format(",d")(d.values.count)); 
            ttdiv.style("display", "block")    
            	 .style("left", (d3.event.pageX + 20) + "px")     
                 .style("top", (d3.event.pageY - 28) + "px");    
            })                  
      .on("mouseout", function(d) {       
           	ttdiv.style("display", "none");
            } );

    var lttdiv = d3.select(parentSelector + " .sb-legend-tooltip");
    var ltt_title = d3.select(parentSelector + " .sb-legend-tooltip .sb-tooltip-title");
    var ltt_body = d3.select(parentSelector + " .sb-legend-tooltip .sb-tooltip-body");

    var legend_dict = {
    	"Base": "base pay for calendar year 2012",
		"OT": "overtime pay for calendar year 2012",
		"Other": "Lump sump payouts for vacation, sick leave and comp time, bonuses and other taxable cash payments",
		"MDV": "Employer contributions to medical, dental and vision plans",
		"ER": "Employer contribution to pension",
		"EE": "Employee contribution to pension paid by the employer",
		"DC": "Employer contribution to deferred compensation (eg. 401(k) or 403(b) plans)",
		"Misc": "Other non-cash costs of employment"
    };

	var legend = svg.selectAll(".legend")
	  .data(color.domain().slice().reverse())
	.enter().append("g")
	  .attr("class", "legend")
	  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
  	  .on("mouseover", function(d) {   
	  		ltt_title.text(d);
	  		ltt_body.text( legend_dict[ d ] );
            lttdiv.style("display", "block")    
            	 .style("left", (d3.event.pageX + 20) + "px")     
                 .style("top", (d3.event.pageY - 28) + "px");    
            })                  
      .on("mouseout", function(d) {       
           	lttdiv.style("display", "none");
            } );	

     var loffset = 50;

	legend.append("rect")
	  .attr("x", width + loffset - 18)
	  .attr("width", 18)
	  .attr("height", 18)
	  .style("fill", color);


	legend.append("text")
	  .attr("x", width + loffset - 24)
	  .attr("y", 9)
	  .attr("dy", ".35em")
	  .style("text-anchor", "end")
	  .text(function(d) { return d; });


}