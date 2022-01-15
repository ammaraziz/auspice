import { extent, groups } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import scaleLinear from "d3-scale/src/linear";
import { select } from "d3-selection";
import { NODE_VISIBLE } from "../../util/globals";


/**
 * React Redux selector function that reduces the tree redux state to an object
 * with the terminal strain names and their requested property.
 *
 * Expects the requested property to be within the tree object as an array of
 * values (e.g. visiblity or nodeColors) since we match the strain to their
 * property values using the node array index.
 *
 * @param {Object} tree
 * @param {string} property
 * @returns {{string: *}}
 */
export const treeStrainPropertySelector = (tree, property) => {
  return tree.nodes.reduce((finalObject, node, index) => {
    // Only store property of termianl strain nodes
    if (!node.hasChildren) {
      finalObject[node.name] = tree[property][index];
    }
    return finalObject;
  }, {});
};

/**
 * Create an object for the scatterplots' design and layout, including the
 * x and y scales based on the provided data and panel width.
 * @param {Array<Object>} data
 * @param {number} width
 * @returns {Object}
 */
export const getPlotLayout = (data, width) => {
  const presets = {
    leftPadding: 120,
    rightPadding: 30,
    topPadding: 20,
    bottomPadding: 50,
    subplotHeight: 100,
    subplotPadding: 20,
    circleRadius: 3
  };

  // Create x scale shared by all subplots
  const xScale = scaleLinear()
    .domain(extent(data, (d) => d.value))
    .range([presets.leftPadding, width - presets.rightPadding])
    .nice();

  // Create y scale for individual subplot SVGs
  const yScale = scaleLinear()
    .domain(extent(data, (d) => d.multiplotJitter))
    .range([presets.subplotHeight, 0])
    .nice();

  return {presets, width, xScale, yScale};
};

/**
 * Filters provided measurements to only measurements for strains that are
 * currently visible in the tree. Visibiity is indicated by the NODE_VISIBLE
 * value in the provided treeStrainVisibility object for strains.
 * @param {Array<Object>} measurements
 * @param {Object<string,number>} treeStrainVisibility
 * @returns {Array<Object>}
 */
export const filterToTreeVisibleStrains = (measurements, treeStrainVisibility) => {
  // Checks visibility against global NODE_VISIBLE variable
  const isVisible = (visibility) => visibility === NODE_VISIBLE;
  return measurements.filter((m) => isVisible(treeStrainVisibility[m.strain]));
};

/**
 * Uses D3.groups to aggregate measurements into an array of groups
 * @param {Array<Object>} measurements
 * @param {string} groupBy
 * @returns {Array<Object>}
 */
export const groupMeasurements = (measurements, groupBy) => {
  return groups(measurements, (d) => d[groupBy]);
};

export const getCleanSVG = (ref) => {
  const svg = select(ref);
  svg.selectAll("*").remove();
  svg.attr("height", null);
  return svg;
};

/**
 * Get the standard DOM id for the provided row of data
 * Throws an error if the provided row has a falsy `id` value that is not 0
 * @param {Object} row
 * @returns {string}
 */
export const getMeasurementDOMId = (row) => {
  if (!row.multiplotId && row.multiplotId !== 0) {
    throw new Error("Encountered measurement without a valid id");
  }
  return `multiplot_meaurement_${row.multiplotId}`;
};

export const drawMultiplotD3SVG = (ref, dataGroups, plotLayout, xAxisLabel, threshold, showThreshold) => {
  const { xScale, yScale, presets, width } = plotLayout;

  // Start fresh by removing everything in SVG
  const svg = getCleanSVG(ref);

  // The number of aggregated groups is the number of subplots, which determines the final SVG height
  const totalSubplotHeight = (presets.subplotHeight * dataGroups.length);
  // Set the overall height for the SVG
  svg.attr("height", totalSubplotHeight + presets.topPadding + presets.bottomPadding);

  // Add x axis to the bottom of the SVG
  svg.append("g")
    .attr("transform", `translate(0, ${totalSubplotHeight + presets.topPadding})`)
    .call(axisBottom(xScale))
    .append("text")
    .attr("x", presets.leftPadding + ((width - presets.leftPadding - presets.rightPadding) / 2))
    .attr("y", presets.bottomPadding)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .text(xAxisLabel);

  let prevSubplotBottom = presets.topPadding;
  dataGroups.forEach(([groupName, dataGroup], index) => {
    // Create a subplot for each data group
    const subplot = svg.append("svg")
      .attr("class", "subplot")
      .attr("width", "100%")
      .attr("height", presets.subplotHeight)
      .attr("y", prevSubplotBottom);

    // Add subplot height to keep track of bottom y position
    prevSubplotBottom += presets.subplotHeight;

    // Add a rect to fill the entire width with a light grey background for every other group
    subplot.append("rect")
      .attr("class", "subplotBackground")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("fill", index % 2 ? "#adb1b3" : "none")
      .attr("fill-opacity", "0.15");

    // Add y axis with a single tick that displays the aggregator's value
    subplot.append("g")
      .attr("class", "subplotYAxis")
      .attr("transform", `translate(${presets.leftPadding}, 0)`)
      .call(
        axisLeft(yScale)
          .ticks(1)
          .tickFormat(() => groupName));

    // Add circles for each measurement of the aggregated data
    subplot.append("g")
      .selectAll("dot")
      .data(dataGroup)
      .enter()
      .append("circle")
        .attr("id", (d) => getMeasurementDOMId(d))
        .attr("cx", (d) => xScale(d.value))
        .attr("cy", (d) => yScale(d.multiplotJitter))
        .attr("r", presets.circleRadius);
  });

  // Add threshold if provided
  if (threshold !== null) {
    const thresholdXValue = xScale(threshold);
    const thresholdLine = svg.append("line")
      .attr("id", "multiplotThreshold")
      .attr("x1", thresholdXValue)
      .attr("x2", thresholdXValue)
      .attr("y1", presets.topPadding)
      .attr("y2", totalSubplotHeight + presets.topPadding)
      .attr("stroke-width", 2)
      .attr("stroke", "#DDD");

    if (!showThreshold) {
      thresholdLine.attr("display", "none");
    }
  }
};

export const colorMultiplotD3SVG = (ref, treeStrainColors) => {
  const svg = select(ref);
  svg.selectAll("circle")
    // Defaults to #AAA if strain is not found in treeStrainColors
    .style("fill", (d) => treeStrainColors[d.strain] || "#AAA");
};

export const getMultiplotTitle = (title, groupByTitle) => {
  let panelTitle = title || "Multiplot";
  if (groupByTitle) {
    panelTitle += ` grouped by ${groupByTitle}`;
  }
  return panelTitle;
};
