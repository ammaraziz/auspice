import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select/lib/Select";
import { changeMultiplotCollection } from "../../actions/multiplot";
import { controlsWidth } from "../../util/globals";
import { SidebarSubtitle } from "./styles";

const MultiplotOptions = () => {
  const dispatch = useDispatch();
  const collectionOptions = useSelector((state) => state.controls.multiplotCollectionOptions);
  const collectionToDisplay = useSelector((state) => state.controls.multiplotCollectionKey);

  // Create array of objects expected for the Select library
  const collectionSelectOptions = [];
  collectionOptions.forEach((title, key) => {
    collectionSelectOptions.push({ value: key, label: title });
  });

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
    </div>
  );
};

export default MultiplotOptions;
