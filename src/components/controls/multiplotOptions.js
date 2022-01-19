import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select/lib/Select";
import {
  changeMultiplotCollection,
  toggleSingleFilter,
  removeAllFieldFilters,
  toggleAllFieldFilters,
  changeMultiplotGroupBy,
  toggleMultiplotThreshold
} from "../../actions/multiplot";
import { controlsWidth, truncateString } from "../../util/globals";
import { FilterBadge } from "../info/filterBadge";
import { SidebarSubtitle } from "./styles";
import Toggle from "./toggle";

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

/**
 * Converts a fieldValues object to an array of react-select options.
 * The fieldValues object keys are field names and the values are sets of field
 * values.
 *
 * Skips fields that only have a single value since they will not be able to
 * filter out any measurements.
 * @param {Object<string, Set>} fieldValues
 * @param {Map<string, string>} groupings
 * @returns {Array<Objects>}
 */
const createFilterOptions = (fieldValues, groupings) => {
  const filterOptions = [];
  Object.entries(fieldValues).forEach(([field, valuesSet]) => {
    // Skip fields with only only one value
    if (valuesSet.size === 1) return;
    // Use field title if availalble
    const fieldTitle = groupings.get(field) || field;
    // Create an select option for each value
    valuesSet.forEach((value) => {
      filterOptions.push({
        value: {field: field, fieldValue: value},
        label: `${fieldTitle} → ${value}`
      });
    });
  });
  return filterOptions;
};

const MultiplotOptions = () => {
  const dispatch = useDispatch();
  const collectionOptions = useSelector((state) => state.controls.multiplotCollectionOptions);
  const collectionToDisplay = useSelector((state) => state.controls.multiplotCollectionKey);
  const groupings = useSelector((state) => state.controls.multiplotGroupings);
  const groupBy = useSelector((state) => state.controls.multiplotGroupByKey);
  const filters = useSelector((state) => state.controls.multiplotFilters);
  const showThreshold = useSelector((state) => state.controls.multiplotShowThreshold);
  const threshold = useSelector((state) => state.multiplot.collectionToDisplay.threshold);
  const fieldValues = useSelector((state) => state.multiplot.collectionFieldValues);

  // Create array of objects expected for the react-select library
  const collectionSelectOptions = createKeyTitleSelectOptions(collectionOptions);
  const groupingSelectOptions = createKeyTitleSelectOptions(groupings);
  const filterOptions = createFilterOptions(fieldValues, groupings);

  const filterFields = Object.entries(filters).map(([field, valuesMap]) => {
    const activeFilterCount = Array.from(valuesMap.values()).reduce((prevCount, currentValue) => {
      return currentValue.active ? prevCount + 1 : prevCount;
    }, 0);
    const fieldTitle = groupings.get(field) || field;
    const badgeTitle = ` ${activeFilterCount} x ${fieldTitle}`;
    return {
      field,
      activeFilterCount,
      badgeTitle
    };
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
      <SidebarSubtitle>
        {"Filter Multiplot Data"}
      </SidebarSubtitle>
      <div style={{ marginBottom: 10, width: controlsWidth, fontSize: 14 }}>
        <Select
          name="multiplotFilters"
          id="multiplotFilters"
          value={undefined}
          options={filterOptions}
          clearable={false}
          searchable
          multi={false}
          onChange={(opt) => {
            const {field, fieldValue} = opt.value;
            dispatch(toggleSingleFilter(field, fieldValue, true));
          }}
        />
      </div>
      {filterFields.length > 0 &&
        <>
          <SidebarSubtitle>
            {"Currently selected filter fields:"}
          </SidebarSubtitle>
          {filterFields.map(({field, activeFilterCount, badgeTitle}) => (
            <div style={{ display: "inline-block", margin: "2px" }} key={field}>
              <FilterBadge
                active={activeFilterCount > 0}
                canMakeInactive
                id={badgeTitle}
                remove={() => dispatch(removeAllFieldFilters(field))}
                activate={() => dispatch(toggleAllFieldFilters(field, true))}
                inactivate={() => dispatch(toggleAllFieldFilters(field, false))}
                onHoverMessage={`Multiplot is currently filtered by ${badgeTitle}`}
              >
                {truncateString(badgeTitle, 25)}
              </FilterBadge>
            </div>
          ))}
        </>
      }
      <Toggle
        display={threshold !== null && threshold !== undefined}
        on={showThreshold}
        label="Show measurement threshold"
        callback={() => dispatch(toggleMultiplotThreshold(!showThreshold))}
      />
    </div>
  );
};

export default MultiplotOptions;
