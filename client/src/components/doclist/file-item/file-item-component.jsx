import React from "react";
import MenuComponent from "../menu/menu-component";
import { ReactComponent as EllipsisIcon } from "../../../icons/v2-ellipsis.svg";
import { ReactComponent as OtherIcon } from "../../../icons/Others.svg";
import classnames from "classnames";
import "./file-item-component.scss";

const IconComponent = function (props) {
  const { type } = props;
  const ChosenIconComponent = {
    ellipsis: EllipsisIcon,
    OTHER: OtherIcon,
  }[type];

  return <ChosenIconComponent className={classnames("app-icon", { "elipssis-icon": type === "ellipsis" })} />;
};

export default class FileItemComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { optionsMenuOpen: false, isItemHovered: false };
  }

  onClick = () => {
    const { fileItem, onClick } = this.props;
    onClick(fileItem);
  };

  onMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { optionsMenuOpen } = this.state;
    this.setState({ optionsMenuOpen: !optionsMenuOpen });
  };

  onMenuOutsideClick = () => {
    this.setState({ optionsMenuOpen: false });
  };

  onRemoveItemClick = () => {
    const { onRemoveItemClick, fileItem } = this.props;

    if (onRemoveItemClick) {
      onRemoveItemClick(fileItem);
    }

    this.setState({ optionsMenuOpen: false });
  };

  onHover = () => {
    this.setState({ isItemHovered: true });
  };

  onBlur = () => {
    this.setState({ isItemHovered: false });
  };

  render() {
    const { fileItem, selectedItemId } = this.props;
    const { optionsMenuOpen, isItemHovered } = this.state;
    const isSelectedItem = fileItem.id === selectedItemId;

    return (
      <div
        className={classnames("file-item-component", { selected: isSelectedItem })}
        onMouseEnter={this.onHover}
        onMouseLeave={this.onBlur}
        onClick={this.onClick}
      >

        <div className="icon-container">
          <IconComponent type={fileItem.type} />
        </div>
        <span className="file-name">{fileItem.name}</span>
        {isItemHovered && (
          <div className="icon-container ellipsis-icon-container" onClick={this.onMenuClick}>
            <IconComponent type={"ellipsis"} />
          </div>
        )}
        {optionsMenuOpen && (
          <MenuComponent
            closeMenuFunction={this.onMenuOutsideClick}
            onRemoveItemClick={this.onRemoveItemClick}
            fileItem={fileItem}
          />
        )}
      </div>
    );
  }
}
