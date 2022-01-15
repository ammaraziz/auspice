import { LOAD_MULTIPLOT_COLLECTIONS, CHANGE_MULTIPLOT_COLLECTION } from "../actions/types";

const getDefaultMultiplotState = () => ({
  loaded: false,
  collections: [],
  collectionToDisplay: {}
});

const multiplot = (state = getDefaultMultiplotState(), action) => {
  switch (action.type) {
    case LOAD_MULTIPLOT_COLLECTIONS:
      return {
        ...state,
        loaded: true,
        collections: action.collections,
        collectionToDisplay: action.collectionToDisplay
      };
    case CHANGE_MULTIPLOT_COLLECTION:
      return {
        ...state,
        loaded: true,
        collectionToDisplay: action.collectionToDisplay
      };
    default:
      return state;
  }
};

export default multiplot;
