import {
  CHANGE_MULTIPLOT_COLLECTION,
  CHANGE_MULTIPLOT_GROUP_BY,
  LOAD_MULTIPLOT_COLLECTIONS,
  TOGGLE_MULTIPLOT_THRESHOLD
} from "./types";

/**
 * Find the collection within collections that has a key matching the provided
 * collectionKey.
 *
 * If collectionKey is not provided, returns the first collection.
 * If no matches are found, returns the first collection.
 * If multiple matches are found, only returns the first matching collection.
 *
 * @param {Array<Object>} collections
 * @param {string} collectionKey
 * @returns {Object}
 */
export const getCollectionToDisplay = (collections, collectionKey) => {
  if (!collectionKey) return collections[0];
  const potentialCollections = collections.filter((collection) => collection.key === collectionKey);
  if (potentialCollections.length === 0) return collections[0];
  if (potentialCollections.length > 1) {
    console.error(`Found multiple collections with key ${collectionKey}. Returning the first matching collection only.`);
  }
  return potentialCollections[0];
};

/**
 * Constructs the controls redux state for the multiplot panel based on
 * config values within the provided collection.
 * @param {Object} collection
 * @returns {Object}
 */
const getCollectionDisplayControls = (collection) => {
  // TODO: consider exisiting control
  const controls = {
    multiplotCollectionKey: collection.key,
    multiplotGroupings: new Map(),
    multiplotGroupByKey: collection["groupings"][0]["key"],
    multiplotShowThreshold: false
  };

  // Create map of groupings' keys and titles for the control panel
  collection.groupings.forEach((grouping) => {
    controls.multiplotGroupings.set(grouping.key, grouping.title || grouping.key);
  });

  if (collection["display_defaults"]) {
    // Set default group by if provided
    const potentialGroupBy = collection["display_defaults"]["group_by"];
    // Verify the provided group by option exists in the groupings options
    if (potentialGroupBy && controls.multiplotGroupings.has(potentialGroupBy)) {
      controls.multiplotGroupByKey = potentialGroupBy;
    }

    // Set default show threshold if provided
    const potentialShowThreshold = collection["display_defaults"]["show_threshold"];
    // Verify the collection has set a threshold
    if (potentialShowThreshold !== null && collection["threshold"] !== null) {
      controls.multiplotShowThreshold = potentialShowThreshold;
    }
  }

  return controls;
};

export const loadMultiplotCollections = (json) => (dispatch, getState) => {
  // TODO: Load controls from state to get potential url query parameters
  const { tree } = getState();
  if (!tree.loaded) {
    throw new Error("tree not loaded");
  }

  const collections = json["collections"];
  if (!collections) {
    throw new Error("Multiplot JSON does not have collections");
  }

  // Add jitter and stable id for each measurement
  collections.forEach((collection) => {
    collection.measurements.forEach((measurement, index) => {
      // Generate Gaussian jitter with a Box-Muller transform
      measurement["multiplotJitter"] = Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random());
      measurement["multiplotId"] = index;
    });
  });

  // Get the collection to display to set up default controls
  // TODO: consider url query parameter?
  const collectionToDisplay = getCollectionToDisplay(collections, json["default_collection"]);

  // Create map of collections' keys and titles for the control panel
  const multiplotCollectionOptions = new Map();
  collections.forEach((collection) => {
    multiplotCollectionOptions.set(collection.key, collection.title || collection.key);
  });

  dispatch({
    type: LOAD_MULTIPLOT_COLLECTIONS,
    collections,
    collectionToDisplay,
    controls: {...getCollectionDisplayControls(collectionToDisplay), multiplotCollectionOptions}
  });
};

export const changeMultiplotCollection = (newCollectionKey) => (dispatch, getState) => {
  const { multiplot } = getState();
  const collectionToDisplay = getCollectionToDisplay(multiplot.collections, newCollectionKey);

  dispatch({
    type: CHANGE_MULTIPLOT_COLLECTION,
    collectionToDisplay,
    controls: {...getCollectionDisplayControls(collectionToDisplay)}
  });
};

export const changeMultiplotGroupBy = (newGroupByKey) => (dispatch) => {
  dispatch({
    type: CHANGE_MULTIPLOT_GROUP_BY,
    multiplotGroupByKey: newGroupByKey
  });
};

export const toggleMultiplotThreshold = (showThreshold) => (dispatch) => {
  dispatch({
    type: TOGGLE_MULTIPLOT_THRESHOLD,
    multiplotShowThreshold: showThreshold
  });
};
