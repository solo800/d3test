(function() {
  $(document).ready(function() {

    d3.json("/data/objectives/increase_custumer_value.tdnps.json", function(error, data) {
      console.log(error ? error : data);

      var dataArr = toArray(data.breakdowns.oe.modes.lh.kpis),
        winH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        winW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        graphH,
        graphW;

      //Set the graph-area to be 50% of the height of the window
      $('.graph-area').height(winH / 2);

      graphH = $('.graph-area').height();
      graphW = $('.graph-area').width();

      var svg = d3.select('.graph-area').append('svg')
        .attr({
          height: graphH,
          width: graphW
        });

      // dataArr.forEach(function(oeKpi) {
      //   console.log(oeKpi);

        buildBar(dataArr, 'circle_value1', svg);
      // });
    });
  });

  //Convert obj to array
  function toArray(obj) {
    if(Object.prototype.toString.call(obj) === '[Object Array]') return obj;

    var arr = [];

    for(var i in obj) {
      if(obj.hasOwnProperty(i)) {
        arr.push([i, obj[i]]);
      }
    }

    return arr;
  }

  //Draw a line based on data
  function buildBar(data, column, svg) {
    if('undefined' === data[column] || 'undefined' === typeof svg) return;

    console.log(svg);

    var h = svg[0][0].clientHeight,
      w = svg[0][0].clientWidth;

    console.log(h, w, data);

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr({
        x: function(d, i) {
          return positionBarX(i, w, data)
        },
        y: function(d) {
          return positionBarY(d[1][column], h);
        },
        width: w / data.length - 2, //Two is default padding, make dynamic later
        height: function(d) {
          return setBarHeight(d[1][column]);
        },
        fill: 'blue'
      });
  }

  function positionBarX(index, width, dataset) {
    return index * (width / dataset.length);
  }
  function positionBarY(data, height) {
    return 0 < data ? height - data : height - (-1 * data);
  }
  function setBarHeight(data) {
    return 0 < data? data : -1 * data;
  }
})();
