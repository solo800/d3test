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
      console.log(error ? error : data);

      //Get the data that applies to the waterfall chart
      var dataArr = data.charts.filter(function(chart) {
        if('undefined' === chart.type) return false;

        return 'waterfall' === chart.type;
      });

      var wfData = formatWaterfallData(dataArr);
      console.log(wfData);
      var xAxisLabels = wfData.map(function(dObj) { return dObj.xAxis; });

      var margin = {top: 30, right: 50, bottom: 30, left: 50},
        padding = 2,
        height = $('#graph-area-waterfall').height() - margin.top - margin.bottom,
        width = $('#graph-area-waterfall').width() - margin.left - margin.right;

      //Set up scales for both the dat and the axis
      var xScale = d3.scale.linear()
          .domain([0, wfData.length])
          .range([0, width]),

        yScale = d3.scale.linear()
            .domain([0, d3.max(wfData, function(d) { return d.value + d.value * 0.1; })])
            .range([0, height]);

      var xAxisScale = d3.scale.ordinal()
            .domain(xAxisLabels)
            .rangePoints([0, width + margin.right]),

        yAxisScale = d3.scale.linear()
            // Adding ten percent of the total ensures the final tick appears
            .domain([0, d3.max(wfData, function(d) { return d.value + d.value * 0.1; })])
            .range([height, 0]);

      var xAxisGen = d3.svg.axis().scale(xAxisScale).orient("bottom"),

        yAxisGen = d3.svg.axis().scale(yAxisScale).orient('left');

      //Create the main svg to hold the graph
      var svg = d3.select('#graph-area-waterfall').append('svg')
          .attr({
            width: width + margin.left + margin.right + 50,
            height: height + margin.top + margin.bottom
          })
        .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var xAxis = svg.append('g').call(xAxisGen)
          .attr({
            class: 'axis waterfall-x',
            transform: 'translate(-' + margin.left + ', ' + height + ')'
          })
          .style({
            fill: 'rgb(30, 77, 140)',
            stroke: 'rgb(30, 77, 140)',
            // 'stroke-width': 1,
          }),
        yAxis = svg.append('g').call(yAxisGen)
            .attr({
              class: 'axis',
              transform: 'translate(-15, 0)'
            })
            .style({
              fill: 'none',
              stroke: 'rgb(30, 77, 140)',
              'stroke-width': 1
            });

      var barGroup = svg.selectAll('rect')
          .data(wfData)
          .enter()
          .append('rect')
          .attr({
            x: function(d, i) { return xScale(i); },
            y: function(d) { return height - yScale(d.value); },
            width: width / wfData.length - padding * 2,
            height: function(d) { return yScale(d.value); },
            fill: function(d, i) { return getFillColor(i, wfData); }
          });

      var axisInterval = window.setInterval(function() {
        if($('#graph-area-waterfall .axis.waterfall-x').length > 0) {
          alignXAxis();
          extendXAxisTicks();
          window.clearInterval(axisInterval);
        }
      }, 30);

      //Hide zero tick on y axis
      $('#graph-area-waterfall .axis:not(.waterfall-x) > g:first-child').remove();

      waterfallAnim();

      //Add trend triangles
      var lineD = wfData.map(function(d, i) {
        var xVal = xScale(i),
          yVal = height - yScale(d.value);

        return {x: xVal, y: yVal, d: d};
      });

      lineD.splice(0, 1);
      lineD.splice(-2, 2);

      //Append the trend triangles to the graph after the animation has finished
      window.setTimeout(function() {
        var curHeight = 0,
          transStr,
          bars = $('#graph-area-waterfall > svg > g > rect');

        bars.slice(0, 1);
        bars.slice(-2, 2);

        svg.selectAll('polygon')
            .data(lineD)
            .enter()
            .append('polygon')
            .attr({
              points: function(d, i) {
                // Shift the x coordinate to center the triangle
                d.x += (((width / wfData.length - padding * 2) / 2) - 5);
                return buildTriangle(d, 5, 0 < d.d.trend);
              },
              transform: function(d) {
                //Move the triangle to the top of the bar it's associated with
                transStr = 'translate(0, ' + ((yScale(d.d.value) - curHeight) - yScale(d.d.value)) + ')';
                curHeight += yScale(d.d.value);
                return transStr;
              },
              stroke: 'none',
              fill: function(d) { return 0 < d.d.trend ? 'green' : 'red'; }
            });
      }, 1500);
    });
  });

  //Animate waterfall chart
  function waterfallAnim() {
    var bars = $('#graph-area-waterfall.chart-anim > svg > g > rect'),
      trends = $('#graph-area-waterfall.chart-anim > svg > g > polygon'),
      curHeight = 0;

    //Remove first two and last two bars from object
    bars.splice(0, 2);
    bars.splice(bars.length - 2, 2);

    window.setTimeout(function() {
      bars.each(function(i, bar) {
        curHeight += parseFloat($(bar).prev('rect').attr('height'));

        $(bar).attr('y', parseFloat($(bar).attr('y')) - curHeight);
      });
    }, 300);
  }

  function buildTriangle(tri, size, orientation) {
    if('undefined' === typeof size) size = 5;
    if('undefined' === typeof orientation) orientation = true;

    if(orientation) {
      return tri.x + ', ' + tri.y + ' ' + (tri.x + size) + ', ' + (tri.y - 2 * size) + ' '
          + (tri.x + 2 * size) + ', ' + tri.y;
    }
    else {
      return tri.x + ', ' + (tri.y - 2 * size) + ' ' + (tri.x + 2 * size) + ', '
          + (tri.y - 2 * size) + ' ' + (tri.x + size) + ', ' + tri.y;
    }
  }

  //Convert Object to array
  //@obj: {Object, Array}
  function toArray(obj, keyOverride) {
    if('[object Array]' === Object.prototype.toString.call(obj)) return obj;

    var arr = [];

    for(var i in obj) {
      if(obj.hasOwnProperty(i)) {
        var returnObj = {
          index: i
        };

        returnObj = toObj(obj[i], returnObj);

        arr.push(returnObj);
      }
    }

    return arr;
  }

  /*
   * Helper function for toArray
   * Takes properties from obj or array and converts them to key value pairs in obj
   * @values: {Object, Array}
   * @obj: {Object} Optional
   */
  function toObj(values, obj) {
    if('undefined' === typeof obj) obj = {};

    if('[object Object]' !== Object.prototype.toString.call(obj)) {
      console.log('toObj did not receive a valid object to return. Values were: ', values);
      return;
    }

    if('[object Object]' === Object.prototype.toString.call(values)) {
      for(var i in values) {
        if(values.hasOwnProperty(i)) {
          obj[i] = values[i];
        }
      }
    }
    else if('[object Array]' === Object.prototype.toString.call(values)) {
      values.forEach(function(val, i) {
        obj[i] = val;
      });
    }
    else {
      obj['value'] = values;
    }

    return obj;
  }

  function formatWaterfallData(data) {
    var returnData = [],
      axisKey = {
        0: '2014A',
        1: {
          1: 'Korea',
          2: 'Taiwan',
          3: 'Japan',
          4: 'Indonesia',
          5: 'Thailand',
          6: 'Malaysia',
          7: 'Srilanka',
          8: 'China'
        },
        2: '9M 2015A',
        3: '9M 2015P'
      },
      currentIndex = 0; // Will be used later to spread the bars across the x axis

    data[0].series.forEach(function(d, i) {
      if(0 === i) {
        returnData.push({
          index: currentIndex,
          xAxis: axisKey[i],
          value: d.data[0].y
        });

        ++currentIndex;
      }
      else if(1 === i) {
        d.data.forEach(function(dataObj, subI) {
          if(0 !== subI) {
            returnData.push({
              index: currentIndex,
              xAxis: axisKey[i][subI],
              value: dataObj.y,
              trend: dataObj.trend
            });

            ++currentIndex;
          }
        });
      }
      else if(i >= 2) {
        returnData.push({
          index: currentIndex,
          xAxis: axisKey[i],
          value: d.data.reduce(function(prev, curr) {
            return prev.y > curr.y ? prev.y : curr.y;
          })
        });

        ++currentIndex;
      }
    });

    return returnData;
  }

  function getFillColor(i, data) {
    if(0 === i) {
      return 'rgb(14, 59, 140)';
    }
    else if(i === data.length - 2) {
      return 'rgb(39, 170, 226)';
    }
    else if(i === data.length -1 ) {
      return 'rgb(29, 117, 189)';
    }
    else {
      return 'rgb(112, 140, 187)';
    }
  }

  //The following functions will eventually need to take a dynamic element id
  function alignXAxis() {
    var text = $('#graph-area-waterfall .axis.waterfall-x text'),
      bars = $('#graph-area-waterfall > svg > g rect'),
      barL,
      barWidth,
      textL,
      textWidth,
      shiftVal;

    bars.each(function(i, bar) {
      barL = $(bar).offset().left;
      barWidth = parseFloat($(bar).attr('width'));
      textL = $(text[i]).offset().left;
      textWidth = $(text[i]).width();

      shiftVal = (barL - textL) + ((barWidth - textWidth) / 2);

      $(text[i]).attr('x', shiftVal);
    });
  }

  function extendXAxisTicks() {
    var ticks = $('#graph-area-waterfall .axis:not(.waterfall-x) line'),
      svgWidth = $('#graph-area-waterfall > svg').width(),
      yAxisOffset = parseInt(getXOfAttr($('#graph-area-waterfall > svg .axis:not(.waterfall-x)').attr('transform'))),
      horizontalMargin = parseInt(getXOfAttr($('#graph-area-waterfall > svg > g').attr('transform'))) * 2;

    ticks.attr('x2', svgWidth - horizontalMargin - yAxisOffset - (-2 * parseInt(ticks.attr('x2'))));
  }

  function getXOfAttr(val) {
    return String(val).slice(val.indexOf('(') + 1, val.indexOf(',')).replace('-', '');
  }

})();
