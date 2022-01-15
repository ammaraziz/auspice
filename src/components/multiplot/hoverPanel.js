import React from "react";
import { infoPanelStyles } from "../../globalStyles";

export const HoverPanel = ({data, elementId, containerDivId}) => {
  if (data === null) return null;
  const containerStyle = {
    position: "absolute",
    width: 200,
    padding: "10px",
    borderRadius: 10,
    zIndex: 1000,
    pointerEvents: "none",
    fontFamily: infoPanelStyles.panel.fontFamily,
    fontSize: 14,
    lineHeight: 1,
    fontWeight: infoPanelStyles.panel.fontWeight,
    color: infoPanelStyles.panel.color,
    backgroundColor: infoPanelStyles.panel.backgroundColor,
    wordWrap: "break-word",
    wordBreak: "break-word"
  };

  const offsets = {
    x: 10,
    y: 10
  };

  // Find the relative position of the hovered element to the element's container div
  const elementContainer = document.getElementById(containerDivId);
  const elementContainerPosition = elementContainer.getBoundingClientRect();
  const elementPosition = document.getElementById(elementId).getBoundingClientRect();
  const relativePosition = {
    top: elementPosition.top - elementContainerPosition.top + elementContainer.scrollTop,
    left: elementPosition.left - elementContainerPosition.left
  };

  // Position hover panel to the right of the element if hovered element
  // is in the left half of the container div and vice versa
  if (relativePosition.left < elementContainerPosition.width * 0.5) {
    containerStyle.left = relativePosition.left + offsets.x;
  } else {
    containerStyle.right = elementContainerPosition.width - relativePosition.left + offsets.x;
  }

  // Position hover panel below the element if the hovered element
  // is in the top half of the container div and vice versa
  if (relativePosition.top - elementContainer.scrollTop < elementContainerPosition.height * 0.5) {
    containerStyle.top = relativePosition.top + offsets.y;
  } else {
    containerStyle.bottom = elementContainerPosition.height - relativePosition.top + offsets.y;
  }

  return (
    <div style={containerStyle}>
      <div className={"tooltip"} style={infoPanelStyles.tooltip}>
        {Object.entries(data).map(([key, value]) => {
          // TODO: map key to display values
          return (
            <p key={key}>{key} : {value}</p>
          );
        })}
      </div>
    </div>
  );
};
