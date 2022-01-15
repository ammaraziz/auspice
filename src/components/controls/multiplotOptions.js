import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select/lib/Select";
import { changeMultiplotCollection, changeMultiplotGroupBy } from "../../actions/multiplot";
import { controlsWidth } from "../../util/globals";
import { SidebarSubtitle } from "./styles";

/**
 * Converts an array of option objects to an array of react-select options.
 * The option object `key` property is mapped to the `value` of the Select option.
 * The option object `title` property is mapped to the `label` of the Select option.
 * @param {Array<Object>} options
 * @returns {Array<Objects>}
 */
const createKeyTitleSelectOptions = (options) => {
  const selectOptions = [];
  options.forEach((title, key) => {
    selectOptions.push({ value: key, label: title });
  });
  return selectOptions;
};

const MultiplotOptions = () => {
  const dispatch = useDispatch();
  const collectionOptions = useSelector((state) => state.controls.multiplotCollectionOptions);
  const collectionToDisplay = useSelector((state) => state.controls.multiplotCollectionKey);
  const groupings = useSelector((state) => state.controls.multiplotGroupings);
  const groupBy = useSelector((state) => state.controls.multiplotGroupByKey);


  // Create array of objects expected for the react-select library
  const collectionSelectOptions = createKeyTitleSelectOptions(collectionOptions);
  const groupingSelectOptions = createKeyTitleSelectOptions(groupings);

  return (
    <div id="multiplotControls">
      <SidebarSubtitle>
        {"Collections"}
      </SidebarSubtitle>
      <div style={{ marginBottom: 10, width: controlsWidth, fontSize: 14}}>
        <Select
          name="multiplotCollections"
          id="multiplotCollections"
          value={collectionToDisplay}
          options={collectionSelectOptions}
          clearable={false}
          searchable={false}
          multi={false}
          onChange={(opt) => {
            dispatch(changeMultiplotCollection(opt.value));
          }}
        />
      </div>
      <SidebarSubtitle>
        {"Group By"}
      </SidebarSubtitle>
      <div style={{ marginBottom: 10, width: controlsWidth, fontSize: 14}}>
        <Select
          name="multiplotGroupings"
          id="multiplotGroupings"
          value={groupBy}
          options={groupingSelectOptions}
          clearable={false}
          searchable={false}
          multi={false}
          onChange={(opt) => {
            dispatch(changeMultiplotGroupBy(opt.value));
          }}
        />
      </div>
    </div>
  );
};

export default MultiplotOptions;
