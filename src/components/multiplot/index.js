import React from "react";
import ErrorBoundary from "../../util/errorBoundry";
import Card from "../framework/card";
import Legend from "../tree/legend/legend";

const Multiplot = ({height, width, showLegend}) => {

  const getSVGContainerStyle = () => {
    return {
      overflowY: "auto",
      position: "relative",
      height: height,
      width: width
    };
  };

  return (
    <Card title="Multiplot">
      {showLegend &&
        <ErrorBoundary>
          <Legend right width={width}/>
        </ErrorBoundary>
      }
      <div id="multiplotSVGContainer" style={getSVGContainerStyle()}>
        <svg
          id="d3multiplotSVG"
          width="100%"
        />
      </div>
    </Card>
  );
};

export default Multiplot;
