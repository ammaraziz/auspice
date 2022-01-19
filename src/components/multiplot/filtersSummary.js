import React from "react";
import { useDispatch } from "react-redux";
import { FilterBadge } from "../info/filterBadge";
import { medGrey, headerFont } from "../../globalStyles";
import { toggleSingleFilter, removeSingleFilter } from "../../actions/multiplot";

const styles = {
  summaryContainer: {
    fontFamily: headerFont,
    fontSize: 14,
    color: medGrey
  },
  fieldContainer: {
    padding: 2
  },
  badgeContainer: {
    padding: 1
  }
};

export const FilterSummary = ({filters, titles}) => {
  const dispatch = useDispatch();
  if (Object.keys(filters).length === 0) return null;
  return (
    <div style={styles.summaryContainer}>
      {/* TODO: show counts of measurements shown and counts per filter? */}
      {"Filtered to "}
      {Object.entries(filters).map(([field, valuesMap]) => {
        return (
          <div key={field} style={styles.fieldContainer}>
            {titles.get(field) || field}{": "}
            {[...valuesMap].map(([fieldValue, {active}]) => {
              return (
                <span style={styles.badgeContainer} key={fieldValue}>
                  <FilterBadge
                    active={active}
                    canMakeInactive
                    id={String(fieldValue)}
                    remove={() => dispatch(removeSingleFilter(field, fieldValue))}
                    activate={() => dispatch(toggleSingleFilter(field, fieldValue, true))}
                    inactivate={() => dispatch(toggleSingleFilter(field, fieldValue, false))}
                    onHoverMessage={`Filtering multiplot to this ${field}`}
                  >
                    {fieldValue}
                  </FilterBadge>
                </span>
              );
            })}
          </div>

        );
      })}
    </div>
  );
};
