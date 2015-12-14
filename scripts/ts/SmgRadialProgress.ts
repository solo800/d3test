/// <reference path="type_definitions/d3.d.ts" />
/// <reference path="type_definitions/jquery.d.ts" />
module SmgRadialProgress {
	interface IRadialProgress {
		data?: ISmgRadialData;
		config?: IConfig;
	}
	interface ISmgRadialData {
		value: number;
		name: string;
	}
	interface IConfig {
		formatData?(data: any): ISmgRadialData;
		graphContainer?: string; //Must be an id of a dom element
		diameter?: number;
		width?: number,
		height?: number;
		margin?: ISmgRadialMargin;
		animate?: boolean;
		duration?: number;
		colors?: {};
		innerRadial?: boolean;
		innerRadialColor?: string;
		fontSize?: number;
		backgroundColor?: string;
		labelColor?: string;
		valueColor?: string;
	}
	interface ISmgRadialMargin {
		top: number,
		right: number,
		bottom: number,
		left: number;
	}
	export class Graph implements IRadialProgress {
		constructor(public data?: any, public config?: IConfig) {
			this.setConfig(config);
			this.setData(data);
		}

		setConfig(config) {
			if ('undefined' === typeof config) {
				this.config = this.defaultConfig;
			}
			else {
				if ('undefined' === typeof config.formatData) {
					this.config.formatData = function (data: any) {
						return data;
					}
				}
				else {
					this.config.formatData = config.formatData;
				}

				if (null === this.config.graphContainer) {
					throw 'Error! Did not receive a valid dom element in which to place the radial progress graph';
				}

				this.config.graphContainer = 'undefined' === typeof config.graphContainer ? this.defaultConfig.graphContainer : config.graphContainer;
				
				//Add # as default graphContainer prefix
				if (this.config.graphContainer.slice(0, 1).indexOf('#') === -1) this.config.graphContainer = '#' + this.config.graphContainer;

				this.config.diameter = 'undefined' === typeof config.diameter ? this.defaultConfig.diameter : config.diameter;
				this.config.width = 'undefined' === typeof config.width ? this.defaultConfig.width : config.width;
				this.config.height = 'undefined' === typeof config.height ? this.defaultConfig.height : config.height;
				this.config.margin = 'undefined' === typeof config.margin ? this.defaultConfig.margin : config.margin;
				this.config.animate = 'undefined' === typeof config.animate ? this.defaultConfig.animate : config.animate;
				this.config.duration = 'undefined' === typeof config.duration ? this.defaultConfig.duration : config.duration;
				this.config.colors = 'undefined' === typeof config.colors ? this.defaultConfig.colors : config.colors;
				this.config.innerRadial = 'undefined' === typeof config.innerRadial ? this.defaultConfig.innerRadial : config.innerRadial;
				this.config.innerRadialColor = 'undefined' === typeof config.innerRadialColor ? this.defaultConfig.innerRadialColor : config.innerRadialColor;
				this.config.fontSize = 'undefined' === typeof config.fontSize ? this.defaultConfig.fontSize : config.fontSize;
				this.config.backgroundColor = 'undefined' === typeof config.backgroundColor ? this.defaultConfig.backgroundColor : config.backgroundColor;
				this.config.labelColor = 'undefined' === typeof config.labelColor ? this.defaultConfig.labelColor : config.labelColor;
				this.config.valueColor = 'undefined' === typeof config.valueColor ? this.defaultConfig.valueColor : config.valueColor;
			}
		}

		setData(data) {
			if ('[object Array]' === Object.prototype.toString.call(data)) this.data = data;

			if ('[object Object]' === Object.prototype.toString.call(data)) {
				this.data = this.config.formatData(data);
			}
		}

		drawGraph() {
			var graphCon = this.config.graphContainer.slice(1);

			this.radialProgress(document.getElementById(graphCon))
				.value(this.data.value)
				.kpiName(this.data.name)
				.render(this.config);
		}

		radialProgress(parent: HTMLElement) {
			var config = this.config,
				_data = null,
				_duration = config.duration,
				_selection,
				_margin = config.margin,
				__width = config.width,
				__height = config.height,
				_diameter = config.diameter,
				_kpiName = this.data.name,
				_fontSize = config.fontSize,
				_value = 0,
				_minValue = 0,
				_maxValue = 100;

			//In case animation is set to false set duration to 0
			_duration = config.animate ? config.duration : 0;

			var _currentArc = 0, _currentArc2 = 0, _currentValue = 0;

			var _arc = d3.svg.arc()
				.startAngle(0 * (Math.PI / 180)); //just radians

			var _arc2 = d3.svg.arc()
				.startAngle(0 * (Math.PI / 180))
				.endAngle(0); //just radians

			_selection = d3.select(parent);

			function component(config) {
				_selection.each(function (data) {
					// Select the svg element, if it exists.
          var svg = d3.select(this).selectAll("svg").data([data]);

          var enter = svg.enter().append("svg")
						.attr("class", "radial-svg");
						
					//Add margin if one was passed in config
					var addMargin = false;
					for (var m in config.margin) {
						if (config.margin.hasOwnProperty(m)) {
							if (0 !== config.margin[m]) addMargin = true;
						}
					}

					if (addMargin) enter.style('margin', config.margin.top + ' ' + config.margin.right + ' ' + config.margin.bottom + ' ' + config.margin.left);

					enter.append("g");
						
          measure();

          svg.attr("width", __width).attr("height", __height);

          var background = enter.append("g").attr("class", "rp-component");

          _arc.endAngle(360 * (Math.PI / 180));

          background.append("rect").attr({
							class: 'rp-background',
							width: _width,
							height: _height
						});

          background.append("path").attr({
							transform: "translate(" + _width / 2 + "," + _width / 2 + ")",
							d: _arc
						});

          _arc.endAngle(_currentArc);
          enter.append("g").attr("class", "arcs");

          var path = svg.select(".arcs").selectAll(".arc").data(data);
          path.enter().append("path").attr({
							class: 'arc',
							transform: 'translate(' + (_width / 2) + ',' + (_width / 2) + ')',
							d: _arc,
							fill: function () { return setColor(config.colors, _value[0]); }
						});

          //Another path in case we exceed 100% and innerRadial is true
					if (config.innerRadial) {
						var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
						path2.enter().append("path").attr({
								class: 'arc2',
								transform: 'translate(' + (_width / 2) + ',' + (_width / 2) + ')',
								d: _arc2,
								fill: config.innerRadialColor
							});
					}

					//Add a circle to give a solid background color
					enter.append('circle').attr({
							cx: _width / 2,
							cy: _height / 2,
							r: _width / 2 * 0.85,
							fill: config.backgroundColor
						});

					enter.append("g").attr("class", "sub-labels");

          var subLabel = svg.select(".sub-labels").selectAll(".label").data(data);

          subLabel.enter().append("text").attr({
							class: 'label name-label',
							y: (_width / 2) - (_fontSize * 0.8),
							x: _width / 2,
							width: _width,
							fill: config.labelColor
						})
						.text(_kpiName)
						.style('font-size', (_fontSize / 2.5) + 'px');

          enter.append("g").attr("class", "labels");

          var label = svg.select(".labels").selectAll(".label").data(data);

          label.enter().append("text").attr({
							class: 'label value-label',
							y: (_width / 2) + (_fontSize / 3),
							x: _width / 2,
							width: _width,
							fill: config.valueColor
						})
						.text(function (d) { return Math.round((_value - _minValue) / (_maxValue - _minValue) * 100) + "%" })
						.style({
							'font-size': _fontSize + 'px',
							'font-weight': 'bold'
						});

          path.exit().transition().duration(500).attr("x", 1000).remove();

          layout(svg);

          function layout(svg) {
						var ratio = (_value - _minValue) / (_maxValue - _minValue),
							endAngle = Math.min(360 * ratio, 360);

						endAngle = endAngle * Math.PI / 180;

						path.datum(endAngle);
						path.transition().duration(_duration).attrTween("d", arcTween);

						if (ratio > 1 && config.innerRadial) {
							path2.datum(Math.min(360 * (ratio - 1), 360) * Math.PI / 180);
							path2.transition().delay(_duration).duration(_duration).attrTween("d", arcTween2);
						}

						label.datum(Math.round(ratio * 100));
						label.transition().duration(_duration).tween("text", labelTween);
          }
				});
			}

			function labelTween(a) {
				var i = d3.interpolate(_currentValue, a);
				_currentValue = i(0);

				return function (t) {
          _currentValue = i(t);
          this.textContent = Math.round(i(t)) + "%";
				}
			}

			function arcTween(a) {
				var i = d3.interpolate(_currentArc, a);

				return function (t) {
          _currentArc = i(t);
          return _arc.endAngle(i(t))();
				};
			}

			function arcTween2(a) {
				var i = d3.interpolate(_currentArc2, a);

				return function (t) {
          return _arc2.endAngle(i(t))();
				};
			}

			function measure() {
				_width = _diameter;
				_height = _width;
				_fontSize = _width * .2;
				_arc.outerRadius(_width / 2);
				_arc.innerRadius(_width / 2 * .85);
				_arc2.outerRadius(_width / 2 * .85);
				_arc2.innerRadius(_width / 2 * .85 - (_width / 2 * .15));
			}

			function setColor(colors: {}, value: number) {
				for (var c in colors) {
					if (colors.hasOwnProperty(c)) {
						if (value < c) return colors[c];
					}
				}

				//If we get this far use the last color
				return colors[c];
			}

			component.render = function (config) {
				measure();
				component(config);
				return component;
			}
				
			component.value = function (_) {
				if (!arguments.length) return _value;
				_value = [_];
				_selection.datum([_value]);
				return component;
			}

			component.margin = function (_) {
				if (!arguments.length) return _margin;
				_margin = _;
				return component;
			};

			component.diameter = function (_) {
				if (!arguments.length) return _diameter
				_diameter = _;
				return component;
			};

			component.minValue = function (_) {
				if (!arguments.length) return _minValue;
				_minValue = _;
				return component;
			};

			component.maxValue = function (_) {
				if (!arguments.length) return _maxValue;
				_maxValue = _;
				return component;
			};

			component.kpiName = function (_) {
				if (!arguments.length) return _kpiName;
				_kpiName = _;
				return component;
			};

			component._duration = function (_) {
				console
				if (!arguments.length) return _duration;
				_duration = _;
				return component;
			};

			component.onClick = function (_) {
				if (!arguments.length) return _mouseClick;
				_mouseClick = _;
				return component;
			}

			return component;
		}

		//Set the graph container id and height and width for dynamic use in setting default config object
		graphConId = '#graph-area-radial'
		defConHeight = $(this.graphConId).height()
		defConWidth = $(this.graphConId).width()

		defaultConfig = {
			formatData: function (data) {
				return data;
			},

			graphContainer: this.graphConId,
			diameter: this.defConHeight < this.defConWidth ? this.defConHeight : this.defConWidth,
			height: this.defConHeight < this.defConWidth ? this.defConHeight : this.defConWidth,
			width: this.defConHeight < this.defConWidth ? this.defConHeight : this.defConWidth,
			margin: { top: 0, right: 0, bottom: 0, left: 0 },
			animate: true,
			duration: 1000,

			colors: {
				25: '#FF0000', // red
				50: '#FF9900', // orange
				75: '#FFFF00', // yellow
				100: '#009900' // green
			},

			innerRadial: false,
			innerRadialColor: '#3660b0', // blue 
			fontSize: 10,
			backgroundColor: 'transparent',
			labelColor: 'rgb(30, 77, 140)',
			valueColor: 'rgb(30, 77, 140)'
		}
	}
}