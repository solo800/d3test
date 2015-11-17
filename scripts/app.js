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

      //Get the waterfall chart
      var dataArr = data.charts.filter(function(chart) {
        if('undefined' === chart.type) return false;

        return 'waterfall' === chart.type;
      });

      // console.log(dataArr);

      var wfData = formatWaterfallData(dataArr);

      // console.log('formatted', wfData);

      var xAxisLabels = wfData.map(function(dObj) { return dObj.xAxis; });

      var margin = {top: 30, right: 50, bottom: 30, left: 50},
        padding = 2,
        height = $('#graph-area').height() - margin.top - margin.bottom,
        width = $('#graph-area').width() - margin.left - margin.right;

      var xScale = d3.scale.linear()
          .domain([0, wfData.length])
          .range([0, width]),

        yScale = d3.scale.linear()
            .domain([0, d3.max(wfData, function(d) { return d.value + d.value * 0.1; })])
            .range([0, height]),

        xAxisScale = d3.scale.ordinal()
            .domain(xAxisLabels)
            .rangePoints([0, width]),

        yAxisScale = d3.scale.linear()
            // Adding ten percent of the total ensures the final tick appears
            .domain([0, d3.max(wfData, function(d) { return d.value + d.value * 0.1; })])
            .range([height, 0]),

        xAxisGen = d3.svg.axis().scale(xAxisScale).orient("bottom");

        yAxisGen = d3.svg.axis().scale(yAxisScale).orient('left');

      var svg = d3.select('#graph-area').append('svg')
          .attr({
            width: width + margin.left + margin.right + 50,
            height: height + margin.top + margin.bottom
          })
        .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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

      var xAxis = svg.append('g').call(xAxisGen)
          .attr({
            class: 'axis lh-x',
            transform: 'translate(0, ' + height + ')'
          }),
        yAxis = svg.append('g').call(yAxisGen)
            .attr({
              class: 'axis',
              transform: 'translate(0, 0)'
            });
    });
  });

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
        0: '2015A',
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
              value: dataObj.y
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

})();
