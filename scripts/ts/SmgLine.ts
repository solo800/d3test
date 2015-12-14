/// <reference path="type_definitions/jquery.d.ts" />
/// <reference path="type_definitions/d3.d.ts" />
module SmgLine {
	interface ILineGraph {
		data?: any[];
		xAxisData?: IxAxisData;
		config?: IConfig;		
		defaultConfig: IConfig;
		defaultAxisConfig: IAxisConfig;
	}
	interface IConfig {
		formatData?(data: any): any[];
		formatAxisData?(data: any): string[];
		colors?: string[];
		margin?: { top: number, right: number, bottom: number, left: number };
		padding?: number;
		strokeWidth?: number;
		dotRadius?: number;
		showDots?: boolean;
		graphContainer?: string;
		height?: number;
		width?: number;
		axis?: IAxisConfig;
		remove?: string[];
	}
	interface IAxisConfig {
		x?: IAxis;
		y?: IAxis;
	}
	interface IAxis {
		stroke?: string;
		strokeWidth?: number;
		fill?: string;
		orientation?: string;
		class?: string;
		transform?: string;
	}
	interface IxAxisData {
		xAxisData: string[];
	}
	export class Graph implements ILineGraph {
		public xAxisData: string[];

		constructor(public data?: any[], public config?: IConfig) {
			this.setConfig(config);
			this.setData(data);
			this.setAxisData(this.data);
		}

		setAxisData(data) {
			this.xAxisData = this.config.formatAxisData(data);
		}

		setConfig(config) {
			if ('undefined' === typeof config) {
				this.config = this.defaultConfig;
			}
			else {
				if ('undefined' === typeof config.formatData) {
					this.config.formatData = function (data: any[]) {
						return data;
					}
				}
				else {
					this.config.formatData = config.formatData;
				}

				if ('undefined' === typeof config.formatAxisData) {
					this.config.formatAxisData = this.defaultConfig.formatAxisData;
				}
				else {
					this.config.formatAxisData = config.formatAxisData;
				}

				this.config.colors = 'undefined' === typeof config.colors ? this.defaultConfig.colors : config.colors;
				this.config.margin = 'undefined' === typeof config.margin ? this.defaultConfig.margin : config.margin;
				this.config.padding = 'undefined' === typeof config.padding ? this.defaultConfig.padding : config.padding;
				this.config.strokeWidth = 'undefined' === typeof config.strokeWidth ? this.defaultConfig.strokeWidth : config.strokeWidth;
				this.config.dotRadius = 'undefined' === typeof config.dotRadius ? this.defaultConfig.dotRadius : config.dotRadius;
				this.config.showDots = 'undefined' === typeof config.showDots ? this.defaultConfig.showDots : config.showDots;
				this.config.graphContainer = 'undefined' === typeof config.graphContainer ? this.defaultConfig.graphContainer : config.graphContainer;
				this.config.height = 'undefined' === typeof config.height ? this.defaultConfig.height : config.height;
				this.config.width = 'undefined' === typeof config.width ? this.defaultConfig.width : config.width;
				this.config.remove = 'undefined' === typeof config.remove ? this.defaultConfig.remove : [];

				//Axis
				if ('undefined' === typeof config.axis) {
					this.config.axis = this.defaultAxisConfig;
				}
				else {
					if ('undefined' === typeof this.config.axis.x) {
						this.config.axis.x = this.defaultAxisConfig.x;
					}
					else {
						var x: IAxis = {};

						x.stroke = 'undefined' === typeof config.axis.x.stroke ? this.defaultAxisConfig.x.stroke : config.axis.x.stroke;
						x.strokeWidth = 'undefined' === typeof config.axis.x.strokeWidth ? this.defaultAxisConfig.x.strokeWidth : config.axis.x.strokeWidth;
						x.fill = 'undefined' === typeof config.axis.x.fill ? this.defaultAxisConfig.x.fill : config.axis.x.fill;
						x.orientation = 'undefined' === typeof config.axis.x.orientation ? this.defaultAxisConfig.x.orientation : config.axis.x.orientation;
						x.class = 'undefined' === typeof config.axis.x.class ? this.defaultAxisConfig.x.class : config.axis.x.class;
						x.transform = 'undefined' === typeof config.axis.x.transform ? this.defaultAxisConfig.x.transform : config.axis.x.transform;

						this.config.axis.x = x;
					}

					if ('undefined' === this.config.axis.y) {
						this.config.axis.y = this.defaultAxisConfig.y;
					}
					else {
						var y: IAxis = {};
						console.log(config);

						y.stroke = 'undefined' === typeof config.axis.y.stroke ? this.defaultAxisConfig.y.stroke : config.axis.y.stroke;
						y.strokeWidth = 'undefined' === typeof config.axis.y.strokeWidth ? this.defaultAxisConfig.y.strokeWidth : config.axis.y.strokeWidth;
						y.fill = 'undefined' === typeof config.axis.y.fill ? this.defaultAxisConfig.y.fill : config.axis.y.fill;
						y.orientation = 'undefined' === typeof config.axis.y.orientation ? this.defaultAxisConfig.y.orientation : config.axis.y.orientation;
						y.class = 'undefined' === typeof config.axis.y.class ? this.defaultAxisConfig.y.class : config.axis.y.class;
						y.transform = 'undefined' === typeof config.axis.y.transform ? this.defaultAxisConfig.y.transform : config.axis.y.transform;

						this.config.axis.y = y;
					}
				}
			}
		}

		setData(data) {
			if ('[object Array]' === Object.prototype.toString.call(data)) this.data = data;

			if ('[object Object]' === Object.prototype.toString.call(data)) {
				this.data = this.config.formatData(data);
			}

			this.normalizeData();
		}

		formatData() {
			this.data = this.config.formatData(this.data);
		}

		drawGraph() {
			var svg = d3.select(this.config.graphContainer).append('svg')
				.attr({
					width: this.config.width + this.config.margin.left + this.config.margin.right,
					height: this.config.height + this.config.margin.top + this.config.margin.bottom
				})
				.append('g').attr('transform', 'translate(' + this.config.margin.left + ',' + this.config.margin.top + ')'),

				dim = {
					margin: this.config.margin,
					padding: this.config.padding,
					height: this.config.height,
					width: this.config.width
				},
				lineColor,
				dotColor,
				colorIndex,
				//Add tooltip div
				tooltip = d3.select('body').append('div')
					.attr('class', 'smg-tooltip')
					.style('opacity', 0);

			this.data.forEach(function (data, i) {
				if ('undefined' === typeof this.config.colors[colorIndex]) {
					colorIndex = 0;
					lineColor = this.config.colors[colorIndex];
					dotColor = this.config.showDots ? this.config.colors[colorIndex] : 'transparent';
				}
				else {
					lineColor = this.config.colors[colorIndex];
					dotColor = this.config.showDots ? this.config.colors[colorIndex] : 'transparent';
					++colorIndex;
				}

				this.buildLine(data, svg, dim, lineColor, this.config.strokeWidth);
				this.addDots(data, svg, dim, dotColor, this.config.dotRadius, tooltip);
			}, this);

			//Add axis
			this.axisGen(this.xAxisData, svg, dim, this.config.axis);

			//Remove any designated elements
			this.config.remove.forEach(function (el) { $(el).remove(); });
		}

		addDots(data, svg, dim, color, dotRadius, tooltip) {
			var yMax;

			this.data.forEach(function (ds) {
				ds.forEach(function (d) {
					if ('undefined' === typeof yMax) yMax = d.value;

					if (d.value > yMax) yMax = d.value;
				});
			});

			var width = dim.width,
				height = dim.height,

				xScale = d3.scale.linear()
					.domain([0, data.length])
					.range([0, width + dim.margin.right])
					.nice(),

				yScale = d3.scale.linear()
					.domain([0, yMax])
					.range([height, 0])
					.nice();

			data.forEach(function (d, i) {
				//Don't output null data points
				if (null !== d.value) {
					svg.append('circle')
						.attr({
							cx: xScale(i),
							cy: yScale(d.value),
							r: dotRadius,
							fill: color,
							transform: 'translate(0, ' + 0 + ')'
						})
						.on('mouseover', function () {
							tooltip.transition().duration(500).style('opacity', 1);
							tooltip.html('<strong>Value: ' + d.value + '</strong>')
								.style('left', (d3.event.x) + 'px')
								.style('top', (d3.event.y - 26) + 'px');
						})
						.on('mouseout', function () {
							tooltip.transition().duration(500).style('opacity', 0);
						});
				}
			});
		}

		buildLine(data, svg, dim, color, strokeWidth) {
			var yMax;
			
			this.data.forEach(function (ds) {
				ds.forEach(function (d) {
					if ('undefined' === typeof yMax) yMax = d.value;

					if (d.value > yMax) yMax = d.value;
				});
			});

			var margin = dim.margin,
				width = dim.width,
				height = dim.height,

				xScale = d3.scale.linear()
					.domain([0, data.length])
					.range([0, width + margin.right])
					.nice(),

				yScale = d3.scale.linear()
					.domain([0, yMax])
					.range([height, 0])
					.nice(),

				lineFn = d3.svg.line()
					.x(function (d, i) { return xScale(i); })
					.y(function (d) { return yScale(d.value); })
					.interpolate('linear');

			//Remove null data points
			var toGraph = data.filter(function (d) {
				if (null !== d.value) return d;
			});

			svg.append('path')
				.attr({
					d: lineFn(toGraph),
					stroke: color,
					'stroke-width': strokeWidth,

					fill: 'none',
					transform: 'translate(0, ' + 0 + ')'
				});
		}

		axisGen(xAxisData, svg, dim, axisConfig) {
			var yMax = 0;

			this.data.forEach(function (ds) {
				ds.forEach(function (d) {
					if (d.value > yMax) yMax = d.value;
				});
			});

			var margin = dim.margin,
				height = dim.height,
				width = dim.width,
	
				xScale = d3.scale.ordinal()
					.domain(xAxisData)
					.rangePoints([0, width + margin.right]),

				yScale = d3.scale.linear()
					.domain([0, yMax])
					.range([height, 0]),

				xGen = d3.svg.axis().scale(xScale).orient(axisConfig.x.orientation),

				yGen = d3.svg.axis().scale(yScale).orient(axisConfig.y.orientation),

				xAxis = svg.append('g').call(xGen)
					.attr({
						class: axisConfig.x.class,
						transform: axisConfig.x.transform
					})
					.style({
						fill: axisConfig.x.fill,
						stroke: axisConfig.x.stroke,
						'stroke-width': axisConfig.x.strokeWidth
					}),

				yaxis = svg.append('g').call(yGen)
					.attr({
						class: axisConfig.y.class,
						transform: axisConfig.y.transform
					})
					.style({
						fill: axisConfig.y.fill,
						stroke: axisConfig.y.stroke,
						'stroke-width': axisConfig.y.strokeWidth
					});

			this.alignXAxis();
		}

		alignXAxis() {
			var ticks = $('.axis.line-x > g > text'),
				dotSet = {},
				dots = $(this.config.graphContainer + ' > svg > g').children('circle'),
				i = 0,
				diff;

			dots.each(function (i, d) {
				if ('undefined' === typeof dotSet[parseInt($(d).attr('cx'))]) {
					dotSet[parseInt($(d).attr('cx'))] = d;
				}
			});

			for (var dot in dotSet) {
				if (dotSet.hasOwnProperty(dot)) {
					diff = ($(dotSet[dot]).offset().left - $(ticks[i]).offset().left) - ($(ticks[i]).width() / 2);

					$(ticks[i]).attr('x', diff);
					++i;
				}
			}
		}

		graphConId = '#graph-area-line'
		defConHeight = $(this.graphConId).height()
		defConWidth = $(this.graphConId).width()
		defConMargin = { top: 30, right: 50, bottom: 30, left: 50 }
		defaultAxisConfig = {
			x: {
				stroke: 'rgb(30, 77, 140)',
				strokeWidth: 1,
				fill: 'rgb(30, 77, 140)',
				orientation: 'bottom',
				class: 'axis line-x',
				transform: 'translate(-' + this.defConMargin.left + ',' + (this.defConHeight - this.defConMargin.top - this.defConMargin.bottom) + ')'
			},
			y: {
				stroke: 'rgb(30, 77, 140)',
				strokeWidth: 1,
				fill: 'none',
				orientation: 'left',
				class: 'axis',
				transform: 'translate(-' + (this.defConMargin.left / 7) + ', 0)'
			}
		}

		defaultConfig = {
			formatData: function (data: any) { return data; },
			formatAxisData: this.formatAxisData,
			colors: ['rgb(85, 142, 213)', 'rgb(31, 73, 125)', 'rgb(49, 133, 156)'],
			margin: this.defConMargin,
			padding: 2,
			strokeWidth: 2,
			dotRadius: 4,
			showDots: true,
			graphContainer: this.graphConId,
			height: this.defConHeight - this.defConMargin.top - this.defConMargin.bottom,
			width: this.defConWidth - this.defConMargin.left - this.defConMargin.right,
			remove: ['#graph-area-line > svg > g > g.axis:not(.line-x) > g:first-child'],
			axis: this.defaultAxisConfig
		}

		formatAxisData(data: any[]) {
			//Get the line with the most data points
			return data.reduce(function (prev, cur) {
				return prev.length > cur.length ? prev : cur;
			}, [])
			.map(function (obj) {
				return obj.month;
			});
		}

		normalizeData() {
			var data = this.data,
				maxDataSet = 0,
				diff;

			data.forEach(function (dataSet) {
				if (dataSet.length > maxDataSet) maxDataSet = dataSet.length;
			});

			data.forEach(function (dataSet, i) {
				diff = maxDataSet - dataSet.length;

				for (diff; diff > 0; diff--) {
					data[i].push({ value: null, month: '' });
				}
			});

			this.data = data;
		}
	}
}