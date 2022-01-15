import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { isEqual } from "lodash";
import ErrorBoundary from "../../util/errorBoundry";
import Card from "../framework/card";
import Legend from "../tree/legend/legend";
import { HoverPanel } from "./hoverPanel";
import {
  treeStrainPropertySelector,
  getPlotLayout,
  filterToTreeVisibleStrains,
  groupMeasurements,
  drawMultiplotD3SVG,
  getCleanSVG,
  colorMultiplotD3SVG,
  getMultiplotTitle,
  getMeasurementDOMId
} from "./utils";

const useDeepCompareMemo = (value) => {
  const ref = useRef();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};

const useDeepCompareEffect = (callback, dependencies) => {
  useEffect(
    callback,
    dependencies.map(useDeepCompareMemo)
  );
};

const Multiplot = ({height, width, showLegend}) => {
  // Use `lodash.isEqual` to deep compare object values to prevent unnecessary re-renderings of the component
  const treeStrainColors = useSelector((state) => treeStrainPropertySelector(state.tree, "nodeColors"), isEqual);
  const treeStrainVisibility = useSelector((state) => treeStrainPropertySelector(state.tree, "visibility"), isEqual);
  const groupBy = useSelector((state) => state.controls.multiplotGroupByKey);
  const groupByTitle = useSelector((state) => state.controls.multiplotGroupings.get(groupBy));
  const showThreshold = useSelector((state) => state.controls.multiplotShowThreshold);
  const collection = useSelector((state) => state.multiplot.collectionToDisplay, isEqual);

  const [hoverData, setHoverData] = useState(null);
  const d3Ref = useRef(null);

  const plotLayout = getPlotLayout(collection.measurements, width);
  const filteredMeasurements = filterToTreeVisibleStrains(collection.measurements, treeStrainVisibility);
  const groupedMeasurements = groupMeasurements(filteredMeasurements, groupBy);

  // Redraw the SVG if updated grouped measurements or plot layout
  useDeepCompareEffect(() => {
    // Create multiplot SVG if we have any grouped data
    if (groupedMeasurements && groupedMeasurements.length > 0) {
      const { x_axis_label, threshold } = collection;
      drawMultiplotD3SVG(d3Ref.current, groupedMeasurements, plotLayout, x_axis_label, threshold, showThreshold, setHoverData);
    } else {
      // If no data is available, clear the SVG
      getCleanSVG(d3Ref.current);
    }
  }, [width, groupedMeasurements]);

  // Update the colors when SVG is redrawn or nodeColors array changes
  useDeepCompareEffect(() => {
    // Apply colors if we have any grouped data
    if (groupedMeasurements && groupedMeasurements.length > 0) {
      colorMultiplotD3SVG(d3Ref.current, treeStrainColors);
    }
  }, [width, groupedMeasurements, treeStrainColors]);

  const getSVGContainerStyle = () => {
    return {
      overflowY: "auto",
      position: "relative",
      height: height,
      width: width
    };
  };

  const svgContainerId = "multiplotSVGContainer";
  return (
    <Card title={getMultiplotTitle(collection.title, groupByTitle)}>
      {showLegend &&
        <ErrorBoundary>
          <Legend right width={width}/>
        </ErrorBoundary>
      }
      <div id={svgContainerId} style={getSVGContainerStyle()}>
        {hoverData &&
          <HoverPanel data={hoverData} elementId={getMeasurementDOMId(hoverData)} containerDivId={svgContainerId}/>
        }
        <svg
          id="d3multiplotSVG"
          width="100%"
          ref={d3Ref}
        />
      </div>
    </Card>
  );
};

export default Multiplot;
