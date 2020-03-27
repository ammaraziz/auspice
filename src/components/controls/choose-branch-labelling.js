import React from "react";
import { connect } from "react-redux";
import Select from "react-select";
import { CHANGE_BRANCH_LABEL, ALWAYS_DISPLAY_TIP_LABELS } from "../../actions/types";
import { SidebarSubtitle } from "./styles";
import { controlsWidth } from "../../util/globals";
import Toggle from "./toggle";

@connect((state) => ({
  selected: state.controls.selectedBranchLabel,
  alwaysDisplayTipLabels: state.controls.alwaysDisplayTipLabels,
  available: state.tree.availableBranchLabels
}))
class ChooseBranchLabelling extends React.Component {
  constructor(props) {
    super(props);
    this.change = (value) => {this.props.dispatch({type: CHANGE_BRANCH_LABEL, value: value.value});};
  }

  togglealwaysDisplayTipLabels = () => (
    this.props.dispatch({type: ALWAYS_DISPLAY_TIP_LABELS, value: !this.props.alwaysDisplayTipLabels})
  )

  render() {
    return (
      <div style={{paddingTop: 5}}>
        <SidebarSubtitle>
          Branch Labels
        </SidebarSubtitle>
        <div style={{width: controlsWidth, fontSize: 14}}>
          <Select
            value={this.props.selected}
            options={this.props.available.map((x) => ({value: x, label: x}))}
            clearable={false}
            searchable={false}
            multi={false}
            onChange={this.change}
          />
        </div>
        <Toggle
          style={{margin: 5}}
          display={this.props.available.length > 1}
          on={this.props.alwaysDisplayTipLabels}
          callback={this.togglealwaysDisplayTipLabels}
          label="Always display tip labels"
        />
      </div>
    );
  }
}

export default ChooseBranchLabelling;
