/*
 * The before setting a radial be sure to update the url which you will access your
 * data from in the d3.json() function
 *
 * Additionally you will probably want to update the main container div which is
 * currently set to access an element with id #graph-area
 */

(function() {
  $(document).ready(function() {
    //Update the immediately following url to be wherever your data is stored
    d3.json("/data/objectives/increase_franchise_value_lh.anp.json", function(error, data) {
    	//console.log(error ? error : data);

    	var lnData = formatLineData(data);

			//Example of using the typescript line graph module
    	//var lineGraph = new SmgLine.Graph(data,
			//	{
			//		//This is the config object
			//		formatData: formatLineData,
			//		formatAxisData: formatAxisData
			//	}
			//	//If we wanted to pass in a custom axis this is where it would be
			//);
    	//console.log('here');
    	//lineGraph.drawGraph();

    	//return;

      //console.log(lnData);

      //Assumed to be param passed in
      var colors = ['rgb(85, 142, 213)', 'rgb(31, 73, 125)', 'rgb(49, 133, 156)'];

      var margin = {top: 30, right: 50, bottom: 30, left: 50},
        padding = 2,
        height = $('#graph-area-line').height() - margin.top - margin.bottom,
        width = $('#graph-area-line').width() - margin.left - margin.right;

      var svg = d3.select('#graph-area-line').append('svg')
          .attr({
            width: width + margin.left + margin.right,
            height: height + margin.top + margin.bottom
          })
          .append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

      var dim = {margin: margin, padding: padding, height: height, width: width};

      lnData.forEach(function(data, i) {
        buildLine(data, svg, dim, colors[i]);
        addDots(data, svg, dim, colors[i]);
      });

      var axisCtx = lnData[0].slice();
      axisCtx.unshift({month: ''});
      buildAxis(axisCtx, svg, dim);
    });
  });

  function buildAxis(data, svg, dimensions) {
    var margin = dimensions.margin,
      height = dimensions.height,
      width = dimensions.width,

      xAxisScale = d3.scale.ordinal()
          .domain(data.map(function(d) { return d.month; }))
          .rangePoints([0, width - margin.right]),
      yAxisScale = d3.scale.linear()
          .domain([
            d3.min(data, function(d) { return d.value; }),
            d3.max(data, function(d) { return d.value; })
          ])
          .range([height, 0]);

    var xAxisGen = d3.svg.axis().scale(xAxisScale).orient('bottom'),

      yAxisGen = d3.svg.axis().scale(yAxisScale).orient('left');

    var xAxis = svg.append('g').call(xAxisGen)
        .attr({
          class: 'axis line-x',
          transform: 'translate(-' + margin.left + ', ' + height + ')'
        })
        .style({
          fill: 'rgb(30, 77, 140)',
          stroke: 'rgb(30, 77, 140)',
					'stroke-width': 1,
					'font-size': '8px'
        }),
      yAxis = svg.append('g').call(yAxisGen)
          .attr({
            class: 'axis',
            transform: 'translate(-12, 0)'
          })
          .style({
            fill: 'none',
            stroke: 'rgb(30, 77, 140)',
            'stroke-width': 1,
						'font-size': '8px'
          });
  }

  function addDots(data, svg, dimensions, color) {
    //console.log('adding dots', data);
    var width = dimensions.width,
      height = dimensions.height;

    var xScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, width])
        .nice(),

      yScale = d3.scale.linear()
          .domain([
            d3.min(data, function(d) { return d.value; }),
            d3.max(data, function(d) { return d.value; })
          ])
          .range([height, 0])
          .nice();

    data.forEach(function(d, i) {
      svg.append('circle')
          .attr({
            cx: xScale(i),
            cy: yScale(d.value),
            r: 4,
            fill: color
          });
    });
  }

  function buildLine(data, svg, dimensions, color) {
    var margin = dimensions.margin,
      width = dimensions.width,
      height = dimensions.height;

    var xScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, width])
        .nice(),

      yScale = d3.scale.linear()
          .domain([
            d3.min(data, function(d) { return d.value; }),
            d3.max(data, function(d) { return d.value; })
          ])
          .range([height, 0])
          .nice();

    var lineFn = d3.svg.line()
        .x(function(d, i) { return xScale(i); })
        .y(function(d) { return yScale(d.value); })
        .interpolate('linear');



    svg.append('path')
        .attr({
          d: lineFn(data),
          stroke: color,
          'stroke-width': 2,
          fill: 'none'
        });
  }

	function filterLineChart(arr) {
		if('undefined' !== arr.type) {
			return 'line' === arr.type;
		}
	}

	function filterLineChartSeries(srs) {
		var srsArr = [];

		srs.data.forEach(function(d, i) {
			srsArr.push({
				value: d,
			});
		});

		return srsArr;
	}

  //Pair the data points for each series with their corresponding x axis point
	function formatLineData(data) {
  	var xAxisLabels = data.charts.filter(filterLineChart)[0].xAxis.categories,
      lnData = data.charts.filter(filterLineChart)[0].series.map(filterLineChartSeries);

  	lnData.forEach(function (srs) {
  		srs.forEach(function (sData, i) {
  			sData.month = xAxisLabels[i];
  		});
  	});

  	lnData = normalizeLineDataSets(lnData);

  	return lnData;
  }

	//This functions ensures all line data sets are of equal length
  function normalizeLineDataSets(lnData) {
  	var ret = [],
  		maxDataSet = 0,
  		diff;

  	lnData.forEach(function (dataSet) {
  		if (dataSet.length > maxDataSet) maxDataSet = dataSet.length;
  	});

  	lnData.forEach(function (dataSet, i) {
  		diff = maxDataSet - dataSet.length;

  		console.log('diff', diff, dataSet.length, maxDataSet);

  		for (diff; diff > 0; diff--) {
  			lnData[i].push({ value: null, month: '' });
  		}
  	});

  	return lnData;
  }

	function formatAxisData(data) {
		//Get the line with the most data points
		var xAxisData = data.reduce(function (prev, cur) {
			return prev.length > cur.length ? prev : cur;
		}, [])
		.map(function (obj) {
			return obj.month;
		}),
		minMax = {min: undefined, max: undefined};
		
		//Add on a blank at the beginning of the x axis
		xAxisData.unshift('');

		data.forEach(function (d) {
			d.forEach(function (dp) {
				if ('undefined' !== typeof dp.value) {
					if (!isNaN(parseFloat(dp.value))) {
						if ('undefined' === typeof minMax.min) minMax.min = parseFloat(dp.value);
						if ('undefined' === typeof minMax.max) minMax.max = parseFloat(dp.value);

						if (minMax.min > parseFloat(dp.value)) minMax.min = parseFloat(dp.value);
						if (minMax.max < parseFloat(dp.value)) minMax.max = parseFloat(dp.value);
					}
				}
			});
		});

		return {
			xAxisData: xAxisData,
			yMin: minMax.min,
			yMax: minMax.max
		};
	}

})();
