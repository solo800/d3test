/*
 * The before setting a radial be sure to update the url which you will access your
 * data from in the d3.json() function
 *
 * Additionally you will probably want to update the main container div which is
 * currently set to access an element with id #graph-area
 */
(function() {
	$(document).ready(function () {
		/***** Line Graph Example *****/
		/*
		d3.json("/data/objectives/increase_franchise_value_lh.anp.json", function (error, data) {

			//SmgLine.Graph(data, configObj [optional], axis [optional]);

			//Randomly generate data for testing
			data = randLineData();

			console.log(data);
			var lineGraph = new SmgLine.Graph(data
				//{
				//	//This is the config object
				//	//showDots: false
				//	//formatData: formatLineData,
				//	//formatAxisData: formatAxisData
				//	//axis: {
				//	//	y: {
				//	//		transform: 'translate(-10, 0)'
				//	//	}
				//	//}
				//}
			);

			lineGraph.drawGraph();
		});
		*/

		/***** Radial Progress Example *****/
		/*
		data = {
			value: 65,
			name: 'Some Name'
		};

		var radProg = new SmgRadialProgress.Graph(data,
			{
				//graphContainer: 'diff'
				colors: {
					20: 'rgb(0, 255, 250)',
					40: 'rgb(33, 160, 158)',
					80: 'rgb(44, 107, 106)',
					100: 'rgb(208, 0, 255)'
				}
				//innerRadial: true,
				//duration: 3000,
				//innerRadialColor: 'orange'
				//margin: {top: 40, right: 0, bottom: 20, left: 20}
			}
			);

		radProg.drawGraph();
		*/
		/***** Stacked Bar Graph Example *****/
		//d3.json("/data/objectives/increase_franchise_value_lh.anp.json", function (error, data) {
		//	console.log(error ? error : data);

		//	var stack = new SmgStackedBar.Graph(data.breakdowns.product.kpis,
		//		{
		//			formatData: formatStackedBarData
		//		}
		//	);

		//	console.log(stack);
		//});



		/***** Horizontal Bar Graph Example *****/
		d3.json("/data/objectives/increase_franchise_value_lh.anp.json", function (error, data) {
			console.log(error ? error : data);

			var hBar = new SmgHorizontalBar.Graph(data,
				{
					formatData: formatHBarGraphData
					//margin: {
					//	top: 50,
					//	right: 50,
					//	bottom: 50,
					//	left: 100
					//},
					//axis: {
					//	y: {
					//		fontSize: 20,
					//		transform: 'translate(8, 0)',
					//		textFill: 'orange'
					//	}
					//}
				});

			console.log(hBar);

			hBar.drawGraph();
		});
	});

	/* Line Graph Helper Functions */
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

  	function filterLineChart(arr) {
  		if ('undefined' !== arr.type) {
  			return 'line' === arr.type;
  		}
  	}
  	function filterLineChartSeries(srs) {
  		var srsArr = [];

  		srs.data.forEach(function (d, i) {
  			srsArr.push({
  				value: d,
  			});
  		});

  		return srsArr;
  	}
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

  		for (diff; diff > 0; diff--) {
  			lnData[i].push({ value: null, month: '' });
  		}
  	});

  	return lnData;
  }

	//Format an object with an x axis labels and y axis min/max values
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

	/* Radial Progress Helper Functions */
	/*
	 * Convert Object to array
	 * @obj: {Object, Array}
	 */
	function toArray(obj) {
		if ('[object Array]' === Object.prototype.toString.call(obj)) return obj;

		var arr = [];

		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				var returnObj = {
					index: i
				};

				returnObj = toObj(obj[i], returnObj);

				arr.push(returnObj);
			}
		}

		return arr;

		/* Helper function for toArray */
		/*
		 * Takes properties from obj or array and converts them to key value pairs in obj
		 * @values: {Object, Array}
		 * @obj: {Object} Optional
		 */
		function toObj(values, obj) {
			if ('undefined' === typeof obj) obj = {};

			if ('[object Object]' !== Object.prototype.toString.call(obj)) {
				console.log('toObj did not receive a valid object to return. Values were: ', values);
				return;
			}

			if ('[object Object]' === Object.prototype.toString.call(values)) {
				for (var i in values) {
					if (values.hasOwnProperty(i)) {
						obj[i] = values[i];
					}
				}
			}
			else if ('[object Array]' === Object.prototype.toString.call(values)) {
				values.forEach(function (val, i) {
					obj[i] = val;
				});
			}
			else {
				obj['value'] = values;
			}

			return obj;
		}
	}

	/* Stacked Bar Graph Helper Functions */
	function formatStackedBarData(data) {
		var sbData = [];
		console.log(this);
		if ('undefined' === typeof this.axis.x.values) {
			throw "Error! Cannot format data. There are no x axis values defined on config.axis.x object.";
		}
		else {
			xAxisVals = this.axis.x.values;
		}

		xAxisVals.forEach(function (barName) {
			data.forEach(function (product) {
				product.items.forEach(function (item) {
					if (item.name === barName) {
						sbData.push(item.value);
					}
				})
			});
		});

		return sbData;
	}

	function randLineData() {
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				data = [],
				numMonths = 0,
				_numMonths,
				curMonth,
				lastDp;

		while (numMonths < 3 || numMonths > 12) {
			numMonths = Math.round(Math.random() * 100);
		}

		for (var i = 0; i < 3; i++) {
			curMonth = 0;
			data.push([]);
			_numMonths = numMonths;

			//Randomly set the first data point
			lastDp = Math.round(Math.random() * 1000);
			data[i].push({ month: months[curMonth++], value: lastDp });

			for (_numMonths; _numMonths > 1; _numMonths--) {
				var t = Math.round(Math.random() * 100);
				lastDp = (Math.random() >= 0.5 || lastDp - t < 0) ? lastDp += t : lastDp -= t;
				data[i].push({ month: months[curMonth++], value: lastDp });
			}
		}

		data.push([]);

		months.forEach(function (m, i) {
			data[data.length - 1].push({
				month: m,
				value: (i + 1) * 100
			});
		});

		return data;
	}

	/* Horizontal Bar Graph Helper Functions */
	function formatHBarGraphData(dataObj) {
		var data = {
			actual: [],
			projected: [],
			labels: []
		},
		kpis = toArray(dataObj.breakdowns.channel.kpis);

		kpis.forEach(function (kpi) {
			if (-1 === data.labels.indexOf(kpi.index)) data.labels.push(kpi.index);

			kpi.items.forEach(function (item) {
				if (item.name.slice(-1) === 'A') {
					data.actual.push(item.value);
				}
				else if (item.name.slice(-1) === 'P') {
					data.projected.push(item.value);
				}
			});
		});

		function toArray(obj) {
			if ('[object Array]' === Object.prototype.toString.call(obj)) return obj;

			var arr = [];

			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					var returnObj = {
						index: i
					};

					returnObj = toObj(obj[i], returnObj);

					arr.push(returnObj);
				}
			}

			return arr;

			/* Helper function for toArray */
			/*
			 * Takes properties from obj or array and converts them to key value pairs in obj
			 * @values: {Object, Array}
			 * @obj: {Object} Optional
			 */
			function toObj(values, obj) {
				if ('undefined' === typeof obj) obj = {};

				if ('[object Object]' !== Object.prototype.toString.call(obj)) {
					console.log('toObj did not receive a valid object to return. Values were: ', values);
					return;
				}

				if ('[object Object]' === Object.prototype.toString.call(values)) {
					for (var i in values) {
						if (values.hasOwnProperty(i)) {
							obj[i] = values[i];
						}
					}
				}
				else if ('[object Array]' === Object.prototype.toString.call(values)) {
					values.forEach(function (val, i) {
						obj[i] = val;
					});
				}
				else {
					obj['value'] = values;
				}

				return obj;
			}
		}

		return data;
	}
})();
