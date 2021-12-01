import { intersection } from "lodash";
import { TOGGLE_PANEL_DISPLAY } from "./types";

/**
 * Determines if there are multiple "grid" panels in the provided
 * `panelsToDisplay`. Currently this only checks for the "tree" and "map"
 * panels, but this paves the way to add more "grid" panels.
 * @param {Array<string>} panelsToDisplay
 * @returns {boolean}
 */
export const hasMultipleGridPanels = (panelsToDisplay) => {
  const gridPanels = ["tree", "map"];
  return intersection(panelsToDisplay, gridPanels).length > 1;
};

export const togglePanelDisplay = (panelName) => (dispatch, getState) => {
  const { controls } = getState();
  const idx = controls.panelsToDisplay.indexOf(panelName);
  let panelsToDisplay;
  if (idx === -1) {/* add */
    panelsToDisplay = controls.panelsAvailable.filter((n) =>
      controls.panelsToDisplay.indexOf(n) !== -1 || n === panelName
    );
  } else { /* remove */
    panelsToDisplay = controls.panelsToDisplay.slice();
    panelsToDisplay.splice(idx, 1);
  }
  const canTogglePanelLayout = hasMultipleGridPanels(panelsToDisplay);
  const panelLayout = canTogglePanelLayout ? controls.panelLayout : "full";
  dispatch({type: TOGGLE_PANEL_DISPLAY, panelsToDisplay, panelLayout, canTogglePanelLayout});
};
