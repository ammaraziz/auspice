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
    circleRadius: 3,
    circleHoverRadius: 5
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
 * Filters provided measurements to measurements for strains that are currently
 * visible in the tree and that are included in the active filters.
 *
 * Visibility is indicated by the NODE_VISIBLE value in the provided
 * treeStrainVisibility object for strains.
 * @param {Array<Object>} measurements
 * @param {Object<straing, number>} treeStrainVisibility
 * @param {Object<string, Map>} filters
 * @returns {Array<Object>}
 */
export const filterMeasurements = (measurements, treeStrainVisibility, filters) => {
  // Checks visibility against global NODE_VISIBLE variable
  const isVisible = (visibility) => visibility === NODE_VISIBLE;
  // Only use active filters to filter measurements
  const activeFilters = {};
  Object.entries(filters).forEach(([field, valuesMap]) => {
    activeFilters[field] = activeFilters[field] || [];
    valuesMap.forEach(({active}, fieldValue) => {
      if (active) {
        activeFilters[field].push(fieldValue);
      }
    });
  });
  return measurements.filter((m) => {
    // First check the strain is visible in the tree
    if (!isVisible(treeStrainVisibility[m.strain])) return false;
    // Then check that it passes all filters in activeFilters
    for (const [field, values] of Object.entries(activeFilters)) {
      if (values.length > 0 && !values.includes(m[field])) return false;
    }
    return true;
  });
};

/**
 * Uses D3.groups to aggregate measurements into an array of groups
 * If groupByFilters Map is provided, sort the groups by the order of the keys.
 * @param {Array<Object>} measurements
 * @param {string} groupBy
 * @param {Map} groupByFilters
 * @returns {Array<Object>}
 */
export const groupMeasurements = (measurements, groupBy, groupByFilters) => {
  const groupedMeasurements = groups(measurements, (d) => d[groupBy]);
  if (groupByFilters) {
    const sortOrder = Array.from(groupByFilters.keys());
    // Sort using a[0] since d3.groups returns a nested array
    // where the groupBy field value is the first element of each array
    groupedMeasurements.sort((a, b) => sortOrder.indexOf(a[0]) - sortOrder.indexOf(b[0]));
  }
  return groupedMeasurements;
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

export const drawMultiplotD3SVG = (ref, dataGroups, plotLayout, xAxisLabel, threshold, setHoverData) => {
  const { xScale, yScale, presets, width } = plotLayout;

  // Start fresh by removing everything in SVG
  const svg = getCleanSVG(ref);

  // The number of aggregated groups is the number of subplots, which determines the final SVG height
  const totalSubplotHeight = (presets.subplotHeight * dataGroups.length);
  // Set the overall height for the SVG
  svg.attr("height", totalSubplotHeight + presets.topPadding + presets.bottomPadding);

  // Add threshold if provided
  if (threshold !== null) {
    const thresholdXValue = xScale(threshold);
    svg.append("line")
      .attr("id", "multiplotThreshold")
      .attr("x1", thresholdXValue)
      .attr("x2", thresholdXValue)
      .attr("y1", presets.topPadding)
      .attr("y2", totalSubplotHeight + presets.topPadding)
      .attr("stroke-width", 2)
      .attr("stroke", "#DDD")
      .attr("display", "none");
  }

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
        .attr("r", presets.circleRadius)
        .on("mouseover", (d, i, elements) => {
          select(elements[i]).transition()
            .duration("100")
            .attr("r", presets.circleHoverRadius);
          // sets hover data state to trigger the hover panel display
          setHoverData(d);
        })
        .on("mouseout", (_, i, elements) => {
          select(elements[i]).transition()
            .duration("200")
            .attr("r", presets.circleRadius);
          // sets hover data state to null to hide the hover panel display
          setHoverData(null);
        });

  });
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

export const toggleThreshold = (ref, showThreshold) => {
  const displayAttr = showThreshold ? null : "none";
  select(ref)
    .select("#multiplotThreshold")
      .attr("display", displayAttr);
};
