This stacked bar chart is constructed from a CSV file storing the populations of different states by age group. The chart employs [conventional margins](http://bl.ocks.org/3019563) and a number of D3 features:

* [d3.csv](https://github.com/mbostock/d3/wiki/CSV) - load and parse data
* [d3.scale.ordinal](https://github.com/mbostock/d3/wiki/Ordinal-Scales) - *x*-position encoding and color encoding
* [d3.scale.linear](https://github.com/mbostock/d3/wiki/Quantitative-Scales) - *y*-position encoding
* [d3.format](https://github.com/mbostock/d3/wiki/Formatting#wiki-d3_format) - SI prefix formatting (e.g., “10M” for 10,000,000)
* [d3.max](https://github.com/mbostock/d3/wiki/Arrays#wiki-d3_max) - compute domains
* [d3.keys](https://github.com/mbostock/d3/wiki/Arrays#wiki-d3_keys) - compute column names
* [d3.svg.axis](https://github.com/mbostock/d3/wiki/SVG-Axes) - display axes

This example doesn’t use [d3.layout.stack](https://github.com/mbostock/d3/wiki/Stack-Layout) because it’s easy to just stack each state independently via [array.forEach](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach). Here, it makes sense to group the rects by state (column), rather than grouping by age group (series), as you do with a [stacked area chart](../3885211).