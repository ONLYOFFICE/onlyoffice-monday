import React from "react";
import { ReactComponent as SearchIcon } from "./search.svg";
import { ReactComponent as ClearIcon } from "./close.svg";
import "./top-bar-component.scss";

export default class TopBarComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldShowClear: false,
    };
  }

  componentDidMount() {
    if (this._input) {
      this._input.focus();
    }
  }

  onChange = (e) => {
    const { onFilterTermChange } = this.props;
    const value = e.currentTarget.value;
    onFilterTermChange(value);
    this.setState({ shouldShowClear: value ? true : false });
  };

  onClearClick = () => {
    const { onFilterTermChange } = this.props;
    const value = "";
    onFilterTermChange(value);
    this.setState({ shouldShowClear: value ? true : false });
  };

  render() {
    const { shouldShowClear } = this.state;
    const { searchTerm } = this.props;

    return (
      <div className="top-bar-component">
        <div className="search-wrapper">
          <div className="search-icon">
            <SearchIcon />
          </div>
          {shouldShowClear && (
            <div className="clear-icon" onClick={this.onClearClick}>
              <ClearIcon />
            </div>
          )}

          <input
            placeholder="Search Files"
            onChange={this.onChange}
            value={searchTerm}
            ref={(el) => {
              this._input = el;
            }}
          />
        </div>
        <div className="button-wrapper" onClick={this.onClick}>
          +
        </div>
      </div>
    );
  }
}
