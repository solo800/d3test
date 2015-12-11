/// <reference path="type_definitions/jquery.d.ts" />
/// <reference path="type_definitions/d3.d.ts" />
var SmgStackedBar;
(function (SmgStackedBar) {
    var Graph = (function () {
        function Graph(data, config) {
            this.data = data;
            this.config = config;
            this.defConGraphContainerId = '#graph-area-stacked-bar';
            this.defConMargin = { top: 30, right: 50, bottom: 30, left: 50 };
            this.defaultConfig = {
                formatData: function (data) { return data; },
                formatScaleData: this.defaultFormatScaleData,
                colors: ['rgb(239, 242, 247)', 'rgb(211, 224, 244)', 'rgb(141, 163, 200)', 'rgb(112, 140, 186)',],
                graphContainer: this.defConGraphContainerId,
                margin: this.defConMargin,
                padding: 26,
                height: $(this.defConGraphContainerId).height() - this.defConMargin.top - this.defConMargin.bottom,
                width: $(this.defConGraphContainerId).width() - this.defConMargin.left - this.defConMargin.right,
                axis: {
                    x: {
                        values: ['Sep 2015', '9M 2015A', '9M 2015P'],
                        orientation: 'bottom',
                        class: 'axis stacked-bar-x',
                        transform: 'translate(-' + this.defConMargin.left + ',' + $(this.defConGraphContainerId).height() + ')',
                        fill: 'rgb(30, 77, 140)',
                        stroke: 'rgb(30, 77, 140)'
                    },
                    y: {
                        orientation: 'left',
                        class: 'axis',
                        transform: 'translate(-15, 0)',
                        fill: 'rgb(30, 77, 140)',
                        stroke: 'rgb(30, 77, 140)',
                        strokeWidth: 1
                    }
                }
            };
            this.scaleData = [];
            this.setConfig(config);
            this.setData(data);
        }
        Graph.prototype.setConfig = function (config) {
            if ('undefined' === typeof config) {
                this.config = this.defaultConfig;
            }
            else {
                this.config.formatData = 'undefined' === typeof config.formatData ? this.defaultConfig.formatData : config.formatData;
                this.config.formatScaleData = 'undefined' === typeof config.formatScaleData ? this.defaultConfig.formatScaleData : config.formatScaleData;
                this.config.colors = 'undefined' === typeof config.colors ? this.defaultConfig.colors : config.colors;
                this.config.graphContainer = 'undefined' === typeof config.graphContainer ? this.defaultConfig.graphContainer : config.graphContainer;
                this.config.margin = 'undefined' === typeof config.margin ? this.defaultConfig.margin : config.margin;
                this.config.padding = 'undefined' === typeof config.padding ? this.defaultConfig.padding : config.padding;
                //Dynamically set height/width if not user defined
                if ('undefined' === typeof this.config.graphContainer) {
                    //No graph container was selected so the default height/width is used
                    this.config.height = 'undefined' === typeof config.height ? this.defaultConfig.height : config.height;
                    this.config.width = 'undefined' === typeof config.width ? this.defaultConfig.width : config.width;
                }
                else {
                    //A custom graph container was selected so dynamically set height width if no user defined value was set on config
                    this.config.height = 'undefined' === typeof config.height ? ($(this.config.graphContainer).height() - this.config.margin.top - this.config.margin.bottom) : config.height;
                    this.config.width = 'undefined' === typeof config.width ? ($(this.config.graphContainer).width() - this.config.margin.left - this.config.margin.right) : config.width;
                }
                //Axis
                if ('undefined' === typeof config.axis) {
                    this.config.axis = this.defaultConfig.axis;
                }
                else {
                    if ('undefined' === typeof config.axis.x) {
                        this.config.axis.x = this.defaultConfig.axis.x;
                    }
                    else {
                        this.config.axis.x.values = 'undefined' === typeof config.axis.x.values ? this.defaultConfig.axis.x.values : config.axis.x.values;
                        this.config.axis.x.orientation = 'undefined' === typeof config.axis.x.orientation ? this.defaultConfig.axis.x.orientation : config.axis.x.orientation;
                        this.config.axis.x.class = 'undefined' === typeof config.axis.x.class ? this.defaultConfig.axis.x.class : config.axis.x.class;
                        this.config.axis.x.transform = 'undefined' === typeof config.axis.x.transform ? this.defaultConfig.axis.x.transform : config.axis.x.transform;
                        this.config.axis.x.fill = 'undefined' === typeof config.axis.x.fill ? this.defaultConfig.axis.x.fill : config.axis.x.fill;
                        this.config.axis.x.stroke = 'undefined' === typeof config.axis.x.stroke ? this.defaultConfig.axis.x.stroke : config.axis.x.stroke;
                    }
                    if ('undefined' === typeof config.axis.y) {
                        this.config.axis.y = this.defaultConfig.axis.y;
                    }
                    else {
                        this.config.axis.y.orientation = 'undefined' === typeof config.axis.y.orientation ? this.defaultConfig.axis.y.orientation : config.axis.y.orientation;
                        this.config.axis.y.class = 'undefined' === typeof config.axis.y.class ? this.defaultConfig.axis.y.class : config.axis.y.class;
                        this.config.axis.y.transform = 'undefined' === typeof config.axis.y.transform ? this.defaultConfig.axis.y.transform : config.axis.y.transform;
                        this.config.axis.y.fill = 'undefined' === typeof config.axis.y.fill ? this.defaultConfig.axis.y.fill : config.axis.y.fill;
                        this.config.axis.y.stroke = 'undefined' === typeof config.axis.y.stroke ? this.defaultConfig.axis.y.stroke : config.axis.y.stroke;
                        this.config.axis.y.strokeWidth = 'undefined' === typeof config.axis.y.strokeWidth ? this.defaultConfig.axis.y.strokeWidth : config.axis.y.strokeWidth;
                    }
                }
            }
        };
        Graph.prototype.setData = function (data) {
            if ('[object Array]' !== typeof Object.prototype.toString.call(data))
                data = this.toArray(data);
            this.data = this.config.formatData(data);
        };
        Graph.prototype.setScaleData = function (data) {
            this.scaleData = this.config.formatScaleData(data);
        };
        Graph.prototype.drawGraph = function () {
            var xScale = d3.scale.linear()
                .domain([0, this.scaleData.length])
                .range([0, this.config.width]), 
            // Note regarding typescript definitions file for d3
            // The typescript type definitions file expects the variable d passed in the max function
            // to be a number however in this case it's an array and as such typescript thinks there is an error
            // however calling d.reduce ensures a number is returned as expected
            yScale = d3.scale.linear()
                .domain([0, d3.max(this.scaleData, function (d) {
                    var max = d.reduce(this.sumArray);
                    return max + max * 0.25;
                })])
                .range([0, this.config.height]), xAxisScale = d3.scale.ordinal()
                .domain(this.config.axis.x.values)
                .rangePoints([0, this.config.width + this.config.margin.right]), yAxisScale = d3.scale.linear()
                .domain([0, d3.max(this.scaleData, function (d) {
                    //Each array of the scale data is actually four sub data points that must be totalled
                    var max = d.reduce(this.sumArray); //See above note regarding typescript definitions file before changing this line of code
                    return max + max * 0.25;
                })])
                .range([this.config.height, 0]), xAxisGen = d3.svg.axis().scale(xAxisScale).orient(this.config.axis.x.orientation), yAxisGen = d3.svg.axis().scale(yAxisScale).orient(this.config.axis.y.orientation), svg = d3.select(this.config.graphContainer).append('svg')
                .attr({
                width: this.config.width + this.config.margin.left + this.config.margin.right + 50,
                height: this.config.height + this.config.margin.top + this.config.margin.bottom
            })
                .append('g').attr('transform', 'translate(' + this.config.margin.left + ',' + this.config.margin.top + ')'), xAxis = svg.append('g').call(xAxisGen)
                .attr({
                class: 'axis stacked-bar-x',
                transform: 'translate(-' + this.config.margin.left + ', ' + this.config.height + ')'
            })
                .style({
                fill: 'rgb(30, 77, 140)',
                stroke: 'rgb(30, 77, 140)',
            }), yAxis = svg.append('g').call(yAxisGen)
                .attr({
                class: 'axis',
                transform: 'translate(-15, 0)'
            })
                .style({
                fill: 'none',
                stroke: 'rgb(30, 77, 140)',
                'stroke-width': 1
            });
        };
        Graph.prototype.toArray = function (obj) {
            if ('[object Array]' === Object.prototype.toString.call(obj))
                return obj;
            var arr = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    var returnObj = {
                        index: i
                    };
                    returnObj = this.toObj(obj[i], returnObj);
                    arr.push(returnObj);
                }
            }
            return arr;
        };
        Graph.prototype.toObj = function (values, obj) {
            if ('undefined' === typeof obj)
                obj = {};
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
        };
        Graph.prototype.defaultFormatScaleData = function (data) {
            var scaleData = [], numCols = this.config.axis.x.values.length, numDataPoints = this.data.length / numCols, c = 0, dp;
            for (c; c < numCols; c++) {
                scaleData.push([]);
                for (dp = 0; dp < numDataPoints; dp++) {
                    scaleData[c].push(data.splice(0, 1));
                }
            }
            return scaleData;
        };
        Graph.prototype.sumArray = function (prev, cur) {
            return prev + cur;
        };
        return Graph;
    })();
    SmgStackedBar.Graph = Graph;
})(SmgStackedBar || (SmgStackedBar = {}));
