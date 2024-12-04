import React from "react";
import * as d3 from "d3";
import axios from "axios";

const grey = "#dddfe2";

export default class Heatmap extends React.Component {
  state = {
    data: []
  };

  constructor() {
    super();

    this._chartRef = React.createRef();
  }

  componentDidMount() {
    this.fetchChartData();
  }

  attachChart() {
    const { data } = this.state;

    const margin = { top: 0, right: 0, bottom: 40, left: 40 },
      width = 300 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    this._svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    var myGroups = d3.map(data, d => d.group).keys();

    var myVars = d3.map(data, d => d.variable).keys();

    // Build X scales and axis:
    var x = d3
      .scaleBand()
      .domain(myGroups)
      .range([0, width])
      .padding(0.1);

    this._svg
      .append("g")
      .style("font-size", 12)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(0))
      .select(".domain")
      .remove();

    // Build Y scales and axis:
    var y = d3
      .scaleBand()
      .domain(myVars)
      .range([0, height])
      .padding(0.1);

    this._svg
      .append("g")
      .style("font-size", 12)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain")
      .remove();

    // Build color scale
    var myColor = d3
      .scaleThreshold()
      .domain([1, 25, 50, 75, 100])
      .range([grey, "#A1E7CC", "#50D2A0", "#31BE88", "#26966B"]);

    // add the squares
    this._svg
      .selectAll()
      .data(data, d => d.group + ":" + d.variable)
      .enter()
      .append("rect")
      .attr("x", d => x(d.group))
      .attr("y", d => y(d.variable))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => myColor(d.value))
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8);
  }

  fetchChartData() {
    axios
      .get(
        "https://gist.githubusercontent.com/erickakoyama/80ba09975fd73c4e3fb29f78ae9318f0/raw/49d0947777e64fddb1e9d2dc01dc8dc251d59a60/heatmap_data.csv"
      )
      .then(({ data }) =>
        this.setState({ data: d3.csvParse(data) }, () => this.attachChart())
      );
  }

  render() {
    return <div id="chart" />;
  }
}
