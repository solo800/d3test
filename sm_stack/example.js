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

      //Assumed that the axis labels will somehow be able to be extrapolated from
      //the data, at the moment the data is not consisten
      var xAxisLabels = ['Sep 2015', '9M 2015A', '9M 2015P'];

      //Assumed that the colors will somehow be able to be configured or extrapolated
      //from the data
      var colors = ['rgb(239, 242, 247)', 'rgb(211, 224, 244)', 'rgb(141, 163, 200)', 'rgb(112, 140, 186)', ];

      var sbDataObj = formatStackedBarData(data.breakdowns.product.kpis);
       //console.log('sb', sbDataObj);

      var sbData = sbDataObj.data,
        sbScaleData = sbDataObj.scaleData;

       console.log('data', sbData);
       console.log('scaleData', sbScaleData);

      var margin = {top: 30, right: 50, bottom: 30, left: 50},
        padding = 26,
        height = $('#graph-area-stacked-bar').height() - margin.top - margin.bottom,
        width = $('#graph-area-stacked-bar').width() - margin.left - margin.right;

      //Set up scales for both the data and the axis
      var xScale = d3.scale.linear()
          .domain([0, sbScaleData.length])
          .range([0, width]),
        yScale = d3.scale.linear()
            .domain([0, d3.max(sbScaleData, function(d) {
              //Each array of the scale data is actually four sub data points that must be totalled
              var max = d.reduce(sumArray);
              return max + max * 0.25;
            })])
            .range([0, height]);

      var xAxisScale = d3.scale.ordinal()
          .domain(xAxisLabels)
          .rangePoints([0, width + margin.right]),

        yAxisScale = d3.scale.linear()
            // Adding ten percent of the total ensures the final tick appears
            .domain([0, d3.max(sbScaleData, function(d) {
              //Each array of the scale data is actually four sub data points that must be totalled
              var max = d.reduce(sumArray);
              return max + max * 0.25;
            })])
            .range([height, 0]);

      var xAxisGen = d3.svg.axis().scale(xAxisScale).orient("bottom"),

        yAxisGen = d3.svg.axis().scale(yAxisScale).orient('left');

      //Create the main svg to hold the graph
      var svg = d3.select('#graph-area-stacked-bar').append('svg')
          .attr({
            width: width + margin.left + margin.right + 50,
            height: height + margin.top + margin.bottom
          })
          .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var xAxis = svg.append('g').call(xAxisGen)
          .attr({
            class: 'axis stacked-bar-x',
            transform: 'translate(-' + margin.left + ', ' + height + ')'
          })
          .style({
            fill: 'rgb(30, 77, 140)',
            stroke: 'rgb(30, 77, 140)',
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

      var yOffset = 0,
        lines = [],
        offsetObj;

      var bars = svg.selectAll('rect')
          .data(sbData)
          .enter()
          .append('rect')
          .attr({
            x: function(d, i) { return getXOffset(i, xScale); },
            y: function(d, i) {
              offsetObj = getYOffset(d, i, sbData, height, yScale, yOffset);

              y = offsetObj.y;
              yOffset = offsetObj.yOffset;

              return y;
            },
            width: width / sbScaleData.length - padding * 2,
            height: function(d, i) {
              //Store top left and right coordinates of this bar in lines to draw trend lines later on
              yOffsetObj = getYOffset(d, i, sbData, height, yScale, yOffset);

              y = yOffsetObj.y;
              yOffset = yOffsetObj.yOffset;

              lines = genTrendLineCoords(getXOffset(i, xScale), width / sbScaleData.length - padding * 2, y, i, lines);
              //End of trend line storage code

              return yScale(d);
            },
            fill: function(d, i) { return getFillColor(colors); }
          });

      //Append the value labels to each individual bar
      yOffset = 0;
      var x, y;

      sbData.forEach(function(data, i) {
        x = getXOffset(i, xScale);
        offsetObj = getYOffset(data, i, sbData, height, yScale, yOffset);

        yOffset = offsetObj.yOffset;
        y = offsetObj.y;
        svg.append('text')
            .attr({
              class: 'sub-total',
              x: x,
              y: y + (yScale(data) / 2) + 5,
              stroke: 'rgb(5, 57, 127)'
            })
            .text(parseInt(data));
      });

      //Format lines into x y coordinate pairs between the bars
      var lineCoords = formatLines(lines);

      //Drawing lines between the various bars
      lineCoords.forEach(function(coords) {
        svg.append('path')
            .attr({
              d: lineFn(coords),
              stroke: 'rgb(5, 57, 127)',
              'stroke-width': 2,
              fill: 'none'
            });
      });

      //Draw the top lines showing time frame trend and add the time frame column totals
      var colTot,
        colTotY,
        topLineCoords = [];

      sbScaleData.forEach(function(data, i) {
        colTot = 0;
        colTotY = 0;

        data.forEach(function(d) {
          colTotY += yScale(d);
          colTot += d;
        });

        //Column totals
        svg.append('text')
            .attr({
              class: 'total',
              x: getXOffset(i * 4, xScale),
              y: height - colTotY - 5,
              stroke: 'rgb(5, 57, 127)'
            })
            .text(parseInt(colTot));

        //Append the upper trend lines and add arrows

        //Store the start and end points for the horizontal line
        if(0 === i) {
          topLineCoords.push([getXOffset(i * 4, xScale) + ((width / sbScaleData.length - padding * 2) / 2), 0]);
        }
        else if(2 === i) {
          topLineCoords.push([getXOffset(i * 4, xScale) + ((width / sbScaleData.length - padding * 2) / 2), 0]);
        }

        //Left/Right vertical trend line
        svg.append('path')
            .attr({
              d: lineFn([
                [getXOffset(i * 4, xScale) + ((width / sbScaleData.length - padding * 2) / 2), 0],
                [getXOffset(i * 4, xScale) + ((width / sbScaleData.length - padding * 2) / 2), 40]
              ]),
              stroke: 'rgb(5, 57, 127)',
              'stroke-width': 2,
              fill: 'none'
            });
        //Add the arrows
        svg.append('polygon')
            .attr({
              points: buildTriangle({
                  x: getXOffset(i * 4, xScale) + ((width / sbScaleData.length - padding * 2) / 2) - 5,
                  y: 45
              }, 5, false),
              stroke: 'none',
              fill: 'rgb(5, 57, 127)'
            });
      });

      //Draw the top horizontal trend line connector
      svg.append('path')
          .attr({
            d: lineFn(topLineCoords),
            stroke: 'rgb(5, 57, 127)',
            'stroke-width': 2,
            fill: 'none'
          });

      //Draw the ellipses showing percentage difference in trend
      for(var e = 0; e <= 1; e++) {
        var start = topLineCoords[0][0],
          end = topLineCoords[1][0],
          mid = (end - start) / 2 + start,
          elipX;

        elipX = 0 === e ? (mid - start) / 2 + start : (end - mid) / 2 + mid;

        //Gen the percentage of change from one time column to the next
        var colTots = [0, 0, 0],
          totPer
          rx = 40,
          ry = 20;

        sbScaleData.forEach(function(data, i) {
          data.forEach(function(d) {
            colTots[i] += d;
          });
        });

        totPer = 0 === e ? (colTots[1] - colTots[0]) / colTots[0] : (colTots[2] - colTots[1]) / colTots[1];

        totPer = parseInt(totPer * 100);

        svg.append('ellipse')
            .attr({
              cx: elipX,
              cy: 0,
              rx: rx,
              ry: ry,
              fill: 'white',
              'stroke-width': 2,
              stroke: 'rgb(5, 57, 127)'
            });
        svg.append('text')
            .attr({
              x: elipX - (rx * 0.45),
              y: ry * 0.25,
              stroke: 'rgb(5, 57, 127)'
            })
            .text(totPer + '%');
      }

      //Hide zero tick on y axis
      $('#graph-area-stacked-bar .axis:not(.stacked-bar-x) > g:first-child').remove();

      var axisInterval = window.setInterval(function() {
        if($('#graph-area-stacked-bar .axis.stacked-bar-x').length > 0) {
          alignXAxis();
          window.clearInterval(axisInterval);
        }
      }, 30);
    });
  });

  var lineFn = d3.svg.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; })
      .interpolate('linear');

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


  //The following functions will eventually need to take a dynamic element id
  function alignXAxis() {
    var text = $('#graph-area-stacked-bar .axis.stacked-bar-x text'),
      totText = $('#graph-area-stacked-bar > svg > g > text.total'),
      subTotText = $('#graph-area-stacked-bar > svg > g > text.sub-total'),
      bars = [],
      barL,
      barWidth,
      textL,
      textWidth,
      shiftVal,
      totTextWidth,
      totShiftVal,
      subTotTextWidth,
      subTotShiftVal,
      found;

    //Get the first bar of each new column
    $('#graph-area-stacked-bar > svg > g > rect').each(function(i, bar) {
      //Check if this x value matches one of the existing ones in bars
      found = false;

      bars.forEach(function(sBar, bI) {
        if(parseInt($(bar).attr('x')) === parseInt($(sBar).attr('x'))) found = true;
      });

      if(!found) {
        bars.push(bar);
      }
    });

    bars.forEach(function(bar, i) {
      barL = $(bar).offset().left;
      barWidth = parseFloat($(bar).attr('width'));
      textL = $(text[i]).offset().left;
      textWidth = $(text[i]).width();
      totTextWidth = $(totText[i]).width();

      shiftVal = (barL - textL) + ((barWidth - textWidth) / 2);

      //The totals are already alligned with their associated column so the calc is different
      totShiftVal = (barWidth - totTextWidth) / 2 + parseInt($(bar).attr('x'));

      $(text[i]).attr('x', shiftVal);
      $(totText[i]).attr('x', totShiftVal);

      //For every single bar there are four sub bars so loop over each centering the sub total
      for(var b = 0; b < 4; b++) {
        subTotTextWidth = $(subTotText[0]).width();

        subTotShiftVal = (barWidth - subTotTextWidth) / 2 + parseInt($(bar).attr('x'));

        $(subTotText[0]).attr('x', subTotShiftVal);

        subTotText.splice(0, 1);
      }
    });
  }

  /*
   * Formatting the line coordinates sucks
   * There is a main array which holds a sub array for each line
   * In each sub array are two arrays which hold the x/y coordinates for the line
   */
  function formatLines(lines) {
    var coords = [];

    lines.forEach(function(bar) {
      bar.forEach(function(subBar, i) {
        if(0 === i) {
          //First sub bar creates sub array for a line and adds the start x/y coordinates
          coords.push([
            [subBar.rightX, subBar.y]
          ]);
        }
        else if(1 === i) {
          //The second sub bar adds the end x/y coordinates for the previous line
          //and then adds a sub array for the next line and it's start x/y coordinates
          coords[coords.length - 1].push([subBar.leftX, subBar.y]);

          //Add the next line and it's start x/y
          coords.push([
            [subBar.rightX, subBar.y]
          ]);
        }
        else if(2 === i) {
          //The third sub bar adds the end x/y coordinates for the previous line
          coords[coords.length - 1].push([subBar.leftX, subBar.y]);
        }
      });
    });

    return coords;
  }

  function genTrendLineCoords(xOffset, width, y, index, lines) {
    // console.log(xOffset, width, y, index, lines);

    var x = xOffset + width,
      arrKey = {
        0: [0, 4, 8],
        1: [1, 5, 9],
        2: [2, 6, 10],
        3: [3, 7, 11]
      },
      key;

    $.each(arrKey, function(k, indexes) {
      if(indexes.indexOf(index) > -1) {
        key = k;
        return true;
      }
    });

    if('undefined' === typeof lines[key]) lines[key] = [];

    lines[key].push({
      leftX: xOffset,
      rightX: xOffset + width,
      y: y
    });

    return lines;
  }

  function getXOffset(i, xScale) {
    var retI = 0;

    if(i < 4) {
      retI = xScale(0);
    }
    else if(i >= 4 && i < 8) {
      retI = xScale(1);
    }
    else {
      retI = xScale(2);
    }
    return retI;
  }

  /*
   * This complex offset function is reused in various areas for generating the
   * bar stacking and the lines that connect the bars
   */
  function getYOffset(data, index, sbData, height, yScale, yOffset) {
    if([0, 4, 8].indexOf(index) > -1) {
      yOffset = 0;
    }
    else {
      //Increment the yOffset up by the previous bar's height
      yOffset += yScale(sbData[index - 1]);
    }
    return {
      y: height - yScale(data) - yOffset,
      yOffset: yOffset
    };
  }

  function yOffsetReset(i, yOffset, height) {
    if([4, 8].indexOf(i) > -1) {
      yOffset = 0;
    }
    else {
      yOffset += height;
    }
    return yOffset;
  }

  function formatStackedBarData(data) {
    var sbData = {
        data: [],
        scaleData: []
  	  },
      //Assumed these keyObj labels will be dynamically extrapolated from data set
      //Currently this is not possible
      keyObj = ['Sep 2015', '9M 2015A', '9M 2015P'];

    if('[object Array]' !== Object.prototype.toString.call(data)) data = toArray(data);

    keyObj.forEach(function(barName) {
      data.forEach(function(product) {
        product.items.forEach(function(item) {
          if(item.name === barName) {
            sbData.data.push(item.value);
          }
        })
      });
    });

    //Add the sub data set arrays
    for(var i = 0; i < keyObj.length; i++) {
      sbData.scaleData.push([]);

      //Add the appropriate number of data points to this sub data array
      //Set subI to either 0, 4, or 8 depending on which sub data set we're at
      var subI = i * sbData.data.length / keyObj.length;

      //subI should increment up the number of times of sbData / the number of sub data sets
      var subILimit = sbData.data.length / keyObj.length + subI;

      for(subI; subI < subILimit; subI++) {
        sbData.scaleData[i].push(sbData.data[subI]);
      }
    }

    return sbData;
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

   var lInd = 0;
   function getFillColor(colors) {
     if('undefined' !== typeof colors[lInd]) {
       return colors[lInd++];
     }
     else {
       lInd = 0;
       return colors[lInd++];
     }
   }

   function sumArray(prev, cur) {
     return prev + cur;
   }
})();
