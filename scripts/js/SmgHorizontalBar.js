/// <reference path="type_definitions/d3.d.ts" />
/// <reference path="type_definitions/jquery.d.ts" />
var SmgHorizontalBar;
(function (SmgHorizontalBar) {
    var Graph = (function () {
        function Graph(data, config) {
            this.data = data;
            this.config = config;
            this.defConGraphContainerId = '#graph-area-horizontal-bar';
            this.defaultConfig = {
                formatData: function (data) { return data; },
                drawAxisX: true,
                drawAxisY: true,
                graphContainer: this.defConGraphContainerId,
                width: $(this.defConGraphContainerId).width(),
                height: $(this.defConGraphContainerId).height(),
                margin: { top: 50, right: 50, bottom: 0, left: 90 },
                padding: 2,
                barColor: 'rgb(255, 255, 255)',
                actualText: {
                    stroke: 'rgb(30, 77, 140)',
                    fontSize: 12,
                    transformFn: this.getActualTextTransform
                },
                projectedText: {
                    stroke: 'rgb(30, 77, 140)',
                    fontSize: 12,
                    transformFn: this.getProjectedTextTransform,
                    transformTriangleFn: this.getProjectedTextTriangleTransform
                },
                percentageText: {
                    stroke: 'rgb(30, 77, 140)',
                    fontSize: 12,
                    transformFn: this.getPercentageTextTransform
                },
                axis: {
                    x: {
                        orientation: 'top',
                        class: 'axis horizontal-bar-x',
                        transform: 'translate(0,-24)',
                        fill: 'transparent',
                        textFill: 'rgb(30, 77, 140)',
                        stroke: 'transparent',
                        fontSize: 12,
                        values: ['9M 2015A', '9M 2015P', '% vs Plan'],
                        transformFn: this.defConAxisTransformFnX
                    },
                    y: {
                        orientation: 'left',
                        class: 'axis horizontal-bar-y',
                        transform: 'translate(0,0)',
                        fill: 'transparent',
                        textFill: 'rgb(30, 77, 140)',
                        stroke: 'transparent',
                        fontSize: 14,
                        strokeWidth: 0
                    }
                }
            };
            this.setConfig(config);
            this.setData(data);
        }
        Graph.prototype.setConfig = function (config) {
            if ('undefined' === typeof config) {
                this.config = this.defaultConfig;
            }
            else {
                this.config.formatData = 'undefined' === typeof config.formatData ? this.defaultConfig.formatData : config.formatData;
                this.config.drawAxisX = 'undefined' === typeof config.drawAxisX ? this.defaultConfig.drawAxisX : config.drawAxisX;
                this.config.drawAxisY = 'undefined' === typeof config.drawAxisY ? this.defaultConfig.drawAxisY : config.drawAxisY;
                this.config.graphContainer = 'undefined' === typeof config.graphContainer ? this.defaultConfig.graphContainer : config.graphContainer;
                this.config.width = 'undefined' === typeof config.width ? this.defaultConfig.width : config.width;
                this.config.height = 'undefined' === typeof config.height ? this.defaultConfig.height : config.height;
                this.config.margin = 'undefined' === typeof config.margin ? this.defaultConfig.margin : config.margin;
                this.config.padding = 'undefined' === typeof config.padding ? this.defaultConfig.padding : config.padding;
                this.config.barColor = 'undefined' === typeof config.barColor ? this.defaultConfig.barColor : config.barColor;
                if ('undefined' === typeof config.actualText) {
                    this.config.actualText = this.defaultConfig.actualText;
                }
                else {
                    this.config.actualText.stroke = 'undefined' === typeof config.actualText.stroke ? this.defaultConfig.actualText.stroke : config.actualText.stroke;
                    this.config.actualText.fontSize = 'undefined' === typeof config.actualText.fontSize ? this.defaultConfig.actualText.fontSize : config.actualText.fontSize;
                    this.config.actualText.transformFn = 'undefined' === typeof config.actualText.transformFn ? this.defaultConfig.actualText.transformFn : config.actualText.transformFn;
                }
                if ('undefined' === typeof config.actualText) {
                    this.config.actualText = this.defaultConfig.actualText;
                }
                else {
                    this.config.actualText.stroke = 'undefined' === typeof config.actualText.stroke ? this.defaultConfig.actualText.stroke : config.actualText.stroke;
                    this.config.actualText.fontSize = 'undefined' === typeof config.actualText.fontSize ? this.defaultConfig.actualText.fontSize : config.actualText.fontSize;
                    this.config.actualText.transformFn = 'undefined' === typeof config.actualText.transformFn ? this.defaultConfig.actualText.transformFn : config.actualText.transformFn;
                }
                if ('undefined' === typeof config.projectedText) {
                    this.config.projectedText = this.defaultConfig.projectedText;
                }
                else {
                    this.config.projectedText.stroke = 'undefined' === typeof config.projectedText.stroke ? this.defaultConfig.projectedText.stroke : config.projectedText.stroke;
                    this.config.projectedText.fontSize = 'undefined' === typeof config.projectedText.fontSize ? this.defaultConfig.projectedText.fontSize : config.projectedText.fontSize;
                    this.config.projectedText.transformFn = 'undefined' === typeof config.projectedText.transformFn ? this.defaultConfig.projectedText.transformFn : config.projectedText.transformFn;
                    this.config.projectedText.transformTriangleFn = 'undefined' === typeof config.projectedText.transformTriangleFn ? this.defaultConfig.projectedText.transformTriangleFn : config.projectedText.transformTriangleFn;
                }
                if ('undefined' === typeof config.percentageText) {
                    this.config.percentageText = this.defaultConfig.percentageText;
                }
                else {
                    this.config.percentageText.stroke = 'undefined' === typeof config.percentageText.stroke ? this.defaultConfig.percentageText.stroke : config.percentageText.stroke;
                    this.config.percentageText.fontSize = 'undefined' === typeof config.percentageText.fontSize ? this.defaultConfig.percentageText.fontSize : config.percentageText.fontSize;
                    this.config.percentageText.transformFn = 'undefined' === typeof config.percentageText.transformFn ? this.defaultConfig.percentageText.transformFn : config.percentageText.transformFn;
                }
                if ('undefined' === typeof config.axis) {
                    this.config.axis = this.defaultConfig.axis;
                }
                else {
                    if ('undefined' === typeof this.config.axis.x) {
                        this.config.axis.x = this.defaultConfig.axis.x;
                    }
                    else {
                        this.config.axis.x.orientation = 'undefined' === typeof config.axis.x.orientation ? this.defaultConfig.axis.x.orientation : config.axis.x.orientation;
                        this.config.axis.x.values = 'undefined' === typeof config.axis.x.values ? this.defaultConfig.axis.x.values : config.axis.x.values;
                        this.config.axis.x.class = 'undefined' === typeof config.axis.x.class ? this.defaultConfig.axis.x.class : config.axis.x.class;
                        this.config.axis.x.transform = 'undefined' === typeof config.axis.x.transform ? this.defaultConfig.axis.x.transform : config.axis.x.transform;
                        this.config.axis.x.fill = 'undefined' === typeof config.axis.x.fill ? this.defaultConfig.axis.x.fill : config.axis.x.fill;
                        this.config.axis.x.textFill = 'undefined' === typeof config.axis.x.textFill ? this.defaultConfig.axis.x.textFill : config.axis.x.textFill;
                        this.config.axis.x.stroke = 'undefined' === typeof config.axis.x.stroke ? this.defaultConfig.axis.x.stroke : config.axis.x.stroke;
                        this.config.axis.x.fontSize = 'undefined' === typeof config.axis.x.fontSize ? this.defaultConfig.axis.x.fontSize : config.axis.x.fontSize;
                    }
                    if ('undefined' === typeof this.config.axis.y) {
                        this.config.axis.y = this.defaultConfig.axis.y;
                    }
                    else {
                        this.config.axis.y.orientation = 'undefined' === typeof config.axis.y.orientation ? this.defaultConfig.axis.y.orientation : config.axis.y.orientation;
                        this.config.axis.y.class = 'undefined' === typeof config.axis.y.class ? this.defaultConfig.axis.y.class : config.axis.y.class;
                        this.config.axis.y.transform = 'undefined' === typeof config.axis.y.transform ? this.defaultConfig.axis.y.transform : config.axis.y.transform;
                        this.config.axis.y.fill = 'undefined' === typeof config.axis.y.fill ? this.defaultConfig.axis.y.fill : config.axis.y.fill;
                        this.config.axis.y.textFill = 'undefined' === typeof config.axis.y.textFill ? this.defaultConfig.axis.y.textFill : config.axis.y.textFill;
                        this.config.axis.y.stroke = 'undefined' === typeof config.axis.y.stroke ? this.defaultConfig.axis.y.stroke : config.axis.y.stroke;
                        this.config.axis.y.strokeWidth = 'undefined' === typeof config.axis.y.strokeWidth ? this.defaultConfig.axis.y.strokeWidth : config.axis.y.strokeWidth;
                        this.config.axis.y.fontSize = 'undefined' === typeof config.axis.y.fontSize ? this.defaultConfig.axis.y.fontSize : config.axis.y.fontSize;
                    }
                }
            }
        };
        Graph.prototype.setData = function (data) {
            this.data = this.config.formatData(data);
        };
        Graph.prototype.drawGraph = function () {
            var labels = this.data.labels, proj = this.data.projected, act = this.data.actual, xMax = 0;
            //Determine the max value for the x axis
            proj.forEach(function (d) {
                xMax = d > xMax ? d : xMax;
            });
            act.forEach(function (d) {
                xMax = d > xMax ? d : xMax;
            });
            //Extend max by ten percent
            xMax = xMax * 1.1;
            var xScale = d3.scale.linear()
                .domain([0, xMax])
                .range([0, this.config.width]), yScale = d3.scale.linear()
                .domain([0, labels.length])
                .range([0, this.config.height]), xAxisScale = d3.scale.ordinal()
                .domain(this.config.axis.x.values)
                .rangePoints([0, this.config.width]), yAxisScale = d3.scale.ordinal()
                .domain(labels)
                .rangePoints([0, this.config.height]), svg = d3.select(this.config.graphContainer).append('svg')
                .attr({
                width: this.config.width + this.config.margin.left + this.config.margin.right,
                height: this.config.height + this.config.margin.top + this.config.margin.bottom
            })
                .append('g').attr('transform', 'translate(' + this.config.margin.left + ',' + this.config.margin.top + ')'), xAxisGen = d3.svg.axis().scale(xAxisScale).orient(this.config.axis.x.orientation), yAxisGen = d3.svg.axis().scale(yAxisScale).orient(this.config.axis.y.orientation), $this = this, 
            //Add the horizontal bars
            bars = svg.selectAll('rect')
                .data(act)
                .enter()
                .append('rect')
                .attr({
                x: function (d) { return 0; },
                y: function (d, i) { return yScale(i); },
                width: function (d) { return xScale(d); },
                height: function () { return ($this.config.height / labels.length) - ($this.config.axis.x.fontSize + ($this.config.padding * 2)); },
                fill: this.config.barColor
            });
            //Add the actual text
            var actG = svg.append('g').attr('class', 'actual-text-container'), actFontSize = this.config.axis.x.fontSize;
            $this = this;
            act.forEach(function (n, i) {
                actG.append('text').attr({
                    x: 0,
                    y: yScale(i),
                    stroke: $this.config.actualText.stroke,
                    transform: $this.config.actualText.transformFn(bars[0][i], $this) //Typescript isn't recognizing $this as being of type IHBarGraph
                }).text(n);
            });
            if (this.config.drawAxisX) {
                svg.append('g').call(xAxisGen)
                    .attr({
                    class: this.config.axis.x.class,
                    transform: this.config.axis.x.transform
                })
                    .style({
                    fill: this.config.axis.x.fill,
                    stroke: this.config.axis.x.stroke
                });
                this.setAxisTextConfig('x');
                this.config.axis.x.transformFn($this);
            }
            if (this.config.drawAxisY) {
                svg.append('g').call(yAxisGen)
                    .attr({
                    class: this.config.axis.y.class,
                    transform: this.config.axis.y.transform
                })
                    .style({
                    fill: this.config.axis.y.fill,
                    stroke: this.config.axis.y.stroke,
                    'stroke-width': this.config.axis.y.strokeWidth
                });
                //Align the y axis labels to be centered in relation to the corresponding bar
                this.alignAxisY();
                //Set the config of the axis
                this.setAxisTextConfig('y');
            }
            //Add the projected text
            var projG = svg.append('g').attr('class', 'projected-text-container');
            proj.forEach(function (n, i) {
                //Append the triangle
                projG.append('polygon').attr({
                    points: $this.buildTriangle({
                        x: xScale(n),
                        y: yScale(i)
                    }, 5, false),
                    stroke: 'none',
                    fill: $this.config.projectedText.stroke,
                    transform: $this.config.projectedText.transformTriangleFn(bars[0][i], $this)
                });
                //Append the number
                projG.append('text').attr({
                    x: xScale(n) + $this.config.axis.x.fontSize,
                    y: yScale(i) - 2,
                    stroke: $this.config.projectedText.stroke,
                    transform: $this.config.projectedText.transformFn(bars[0][i], $this)
                }).text(n);
            });
            var perDifG = svg.append('g').attr('class', 'proj-act-diff-percentage-container');
            proj.forEach(function (p, i) {
                perDifG.append('text').attr({
                    x: $this.config.width,
                    y: yScale(i),
                    fill: $this.config.projectedText.stroke,
                    transform: $this.getPercentageTextTransform(bars[0][i], $this)
                }).text($this.calcPercentageDiff(p, act[i]));
            });
        };
        Graph.prototype.calcPercentageDiff = function (projected, actual) {
            return this.frmNum((actual / projected * 100)) + '%';
        };
        Graph.prototype.buildTriangle = function (tri, size, orientation) {
            if ('undefined' === typeof size)
                size = 5;
            if ('undefined' === typeof orientation)
                orientation = true;
            //Adjust x coordinate to ensure proper coordinate allignment
            tri.x = tri.x - size;
            if (orientation) {
                return tri.x + ', ' + tri.y + ' ' + (tri.x + size) + ', ' + (tri.y - 2 * size) + ' '
                    + (tri.x + 2 * size) + ', ' + tri.y;
            }
            else {
                return tri.x + ', ' + (tri.y - 2 * size) + ' ' + (tri.x + 2 * size) + ', '
                    + (tri.y - 2 * size) + ' ' + (tri.x + size) + ', ' + tri.y;
            }
        };
        Graph.prototype.getActualTextTransform = function (bar, $this) {
            var trans = 'translate(', barDim = $this.getBarDimensions(bar, 'actualText'), x = 4, y = (barDim.height / 2) + (barDim.fontSize / 2);
            if (barDim.width < barDim.fontSize) {
                x = barDim.width + 4;
            }
            trans += String(x + ',' + String(y + ')'));
            return trans;
        };
        Graph.prototype.getProjectedTextTransform = function (bar, $this) {
            return 'translate(0,0)';
        };
        Graph.prototype.getProjectedTextTriangleTransform = function (bar, $this) {
            return 'translate(0,0)';
        };
        Graph.prototype.getPercentageTextTransform = function (bar, $this) {
            var trans = 'translate(', barDim = $this.getBarDimensions(bar, 'percentageText'), x = barDim.fontSize * -2, y = (barDim.height / 2) + (barDim.fontSize / 2);
            trans += String(x + ',' + String(y + ')'));
            return trans;
        };
        Graph.prototype.getBarDimensions = function (bar, type) {
            return {
                height: parseInt($(bar).attr('height')),
                width: parseInt($(bar).attr('width')),
                fontSize: this.config[type].fontSize
            };
        };
        Graph.prototype.setAxisTextConfig = function (axis) {
            var fill = this.config.axis.y.textFill, fontSize = -1 === String(this.config.axis[axis].fontSize).indexOf('px') ? String(this.config.axis[axis].fontSize) + 'px' : String(this.config.axis[axis].fontSize), axisClasses = this.config.axis[axis].class.split(' '), axisClass = '';
            axisClasses.forEach(function (c) {
                axisClass += String('.' + c);
            });
            $(axisClass + ' text').each(function (i, t) {
                $(t).css({
                    fill: fill,
                    'font-size': fontSize
                });
            });
        };
        Graph.prototype.alignAxisY = function () {
            var axisClasses = this.config.axis.y.class.split(' '), bars = $(this.config.graphContainer + ' rect'), axisClass = '', text, barH, barOffset, textH, textOffset, diff, fontSize = String(this.config.axis.y.fontSize);
            axisClasses.forEach(function (c) {
                axisClass += ('.' + String(c));
            });
            text = $(axisClass + ' text');
            text.each(function (i, t) {
                barH = parseFloat($(bars[i]).attr('height'));
                barOffset = $(bars[i]).offset().top;
                textH = $(t).height();
                textOffset = $(t).offset().top;
                diff = barOffset - textOffset + ((barH / 2) - (textH / 2));
                $(t).attr('transform', 'translate(0, ' + diff + ')');
            });
        };
        Graph.prototype.defConAxisTransformFnX = function ($this) {
            var xClasses = $this.config.axis.x.class.split(' '), xClass = '', ticks, svg, keyColor;
            xClasses.forEach(function (c) {
                xClass += ('.' + c);
            });
            ticks = $(xClass + ' text');
            svg = d3.selectAll(xClass + ' > g');
            ticks.each(function (i, t) {
                if (0 === i) {
                    keyColor = $this.config.barColor;
                }
                else if (1 === i) {
                    keyColor = $this.config.projectedText.stroke;
                }
                else if (2 === i) {
                    keyColor = 'transparent';
                }
                d3.select(svg[0][i]).append('rect').attr({
                    x: ($(t).width() / 2) + ($this.config.axis.x.fontSize / 2),
                    y: (-1 * $(t).height() - ($this.config.axis.x.fontSize / 2)),
                    width: $this.config.axis.x.fontSize,
                    height: $this.config.axis.x.fontSize,
                    fill: keyColor
                });
            });
            console.log(svg);
        };
        Graph.prototype.frmNum = function (num, dec) {
            if (dec === void 0) { dec = 2; }
            var strNum = num.toFixed(dec), parts = strNum.split('.'), char = parts[0], mant = parts.length > 1 ? '.' + parts[1] : '', rgx = /(\d+)(\d{3})/;
            while (rgx.test(char)) {
                char = char.replace(rgx, '$1' + ',' + '$2');
            }
            return char + mant;
        };
        return Graph;
    })();
    SmgHorizontalBar.Graph = Graph;
})(SmgHorizontalBar || (SmgHorizontalBar = {}));
