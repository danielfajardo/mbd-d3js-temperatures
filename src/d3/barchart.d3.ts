import { select, mouse } from "d3-selection";
import { scaleBand, scaleLinear } from "d3-scale";
import { malagaStats, avgTemp, minTemp, maxTemp } from "./barchart.data";
import { extent, max, min } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { interpolateRdBu } from "d3-scale-chromatic";

const d3 = {
    select,
    scaleBand,
    scaleLinear,
    extent,
    axisBottom,
    axisLeft,
    max,
    min,
    interpolateRdBu,
}

// Configuration for the SVG with the viewBox

const width = 500;
const height = 300;
const padding = 50;

const card = d3
    .select("#root")
    .append("div")
    .attr("class", "card");

const svg = card
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `${-padding} ${-padding} ${width + 2 * padding} ${height + 2 * padding}`);

const tooltip = select("#root")
    .append("div")
    .style("display", "none")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("border-radius", "3px")
    .style("background-color", "black")
    .style("color", "white")
    .style("opacity", "0.7");

// Creating scales

const temperatureConcat = malagaStats.reduce((acc, item) => acc.concat(item.values), [])

const xScale = d3
    .scaleBand<number>()
    .domain(avgTemp.map((d, i) => i))
    .range([0, width])
    .paddingInner(0.1);

const yScale = d3
    .scaleLinear()
    .domain([d3.min(temperatureConcat) - 1, d3.max(temperatureConcat) + 1])
    .range([height, 0]);

const temperatureScale = d3.scaleLinear()
    .domain(d3.extent(temperatureConcat))
    .range([1, 0]);

const colorScale = (temperatureConcat) => d3.interpolateRdBu(temperatureScale(temperatureConcat))

// 100%: first position - 0%: second position

const gradientColor = ["#fe0000", "#252850"]

// Creating some groups

const barGroup = svg
    .append("g");

const axisGroup = svg
    .append("g")

const legendGroup = svg
    .append("g")

// Adding max temperatures to the SVG

barGroup
    .selectAll("max")
    .data(maxTemp)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xScale(i))
    .attr("y", (d) => yScale(d))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d))
    //.attr("fill", d => colorScale(d))
    .attr("fill", "url(#barGradient)")
    .style("stroke", "white")
    .style("stroke-width", "1px")
    .on("mouseenter", onMouseEnter)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

// Adding avg temperatures to the SVG

barGroup
    .selectAll("avg")
    .data(avgTemp)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xScale(i))
    .attr("y", (d) => yScale(d))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d))
    //.attr("fill", d => colorScale(d))
    .attr("fill", "url(#barGradient)")
    .style("stroke", "white")
    .style("stroke-width", "1px")
    .on("mouseenter", onMouseEnter)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

// Adding min temperatures to the SVG

barGroup
    .selectAll("min")
    .data(minTemp)
    .enter()
    .append("rect")
    .attr("x", (d,i) => xScale(i))
    .attr("y", (d) => yScale(d))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d))
    //.attr("fill", d => colorScale(d))
    .attr("fill", "url(#barGradient)")
    .style("stroke", "white")
    .style("stroke-width", "1px")
    .on("mouseenter", onMouseEnter)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);


// Setting the axes

const tickLabels = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

axisGroup
    .append("g")
    .call(d3.axisLeft(yScale));

axisGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickFormat((i) => tickLabels[i]));

svg
    .append("text")
    .attr("transform", `translate(${3 * width / 7},${height + 35})`)
    .style("text-anchor", "start")
    .text("Months");

svg
    .append("text")
    .attr("transform", `rotate(-90)`)
    .attr("x", 0 - 2 * height / 3)
    .attr("y", -30)
    .style("text-anchor", "start")
    .text("Temperatures");

// Setting the legend

legendGroup
    .attr("transform", `translate(${width - 1.2 * padding},0)`)
    .attr("stroke", "white")
    .attr("stroke-width", "0.5px")

const legend = legendGroup
    .selectAll("rect")
    .data([0, 1])
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${20 * i})`)

const hexToRGB = (hexStr: string) => {
    const hexInt = parseInt(hexStr.slice(1), 16);
    const r = (hexInt >> 16) & 255;
    const g = (hexInt >> 8) & 255;
    const b = hexInt & 255;
    return `rgb(${r}, ${g}, ${b})`
}


legend.append("rect")
    .data(gradientColor.map((d, i) => hexToRGB(d)))
    .attr("width", 65)
    .attr("height", 20)
    //.attr("fill", (d, i) => d3.interpolateRdBu(i))
    .attr("fill", (d, i) => d)

legend.append("text")
    .attr("transform", "translate(15)")
    .attr("alignment-baseline", "text-before-edge")
    .attr("fill", "white")
    .data(["Hot", "Cold"])
    .text((d, i) => d)

const gradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "barGradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "0")
    .attr("y1", height)
    .attr("x2", "0")
    .attr("y2", "0");

gradient
    .append("stop")
    .attr("offset", "0")
    .attr("stop-color", gradientColor[1]);
gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", gradientColor[0]);


// Functions for the tooltip

function onMouseEnter(d) {
    tooltip
        .style("display", "block")
        .html(`
            <p><b>Temperature</b>: ${d}</p>
          `);

};


function onMouseMove() {
    const [mx, my] = mouse(document.body);

    tooltip
        .style("left", `${mx + 10}px`)
        .style("top", `${my + 10}px`);
};

function onMouseLeave() {
    tooltip
        .style("display", "none");

}