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
    d3.json("/data/objectives/increase_custumer_value.tdnps.json", function(error, data) {
      console.log(error ? error : data);

      var dataArr = toArray(data.breakdowns.oe.modes.lh.kpis);

      // Log data array to inspect data
      // console.log(dataArr);

      //Iterate over data set and create a radial circle for each one
      dataArr.forEach(function(dataObj) {
        //Append a new graph-area-{index}
        //Also, you may want to change the element you're selecting from #graph-area
        d3.select('#graph-area').append('div').attr({
          id: 'graph-area-' + dataObj.index,
          class: 'graph-sub-area'
        });

        //Add radial progress circle
        radialProgress(document.getElementById('graph-area-' + dataObj.index))
          .label(dataObj.circle_title)
          .subLabel(dataObj.name)
          .diameter($('#graph-area-' + dataObj.index).width())
          .value(dataObj.circle_value1)
          .render();
      });

    });
  });

  //Convert Object to array
  //@obj: {Object, Array}
  function toArray(obj) {
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

})();
