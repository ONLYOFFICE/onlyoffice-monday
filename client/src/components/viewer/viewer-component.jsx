import React, { useEffect } from "react";
import "./viewer-component.scss";

export default class ViewerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { config: "", scriptTag: null, editorsLoaded: false };
  }

  componentDidMount() {
    const script = document.createElement("script");
    script.src = "http://docs:9090/OfficeWeb/apps/api/documents/api.js";
    script.async = true;
    document.body.appendChild(script);

    this.setState({ scriptTag: script });
  }

  componentWillUnmount() {
    const { scriptTag } = this.state;
    if (scriptTag) {
      document.body.removeChild(scriptTag);
    }
  }

  async componentDidUpdate(prevProps) {
    const { item } = this.props;
    const { config, editorsLoaded } = this.state;

    if (item && item.id !== ( prevProps.item ? prevProps.item.id : -1)) {
      await this.fetchConfig(item);
      this.setState({ editorsLoaded: false });
    }

    if (!editorsLoaded && config) {
      this.setState({ editorsLoaded: true });
      this.loadEditors();
    }
  }

  fetchConfig = async (item) => {
    const res = await fetch(`http://back:8305/editor/${item.id}/${item.itemId}/${item.boardId}`);
    const text = await res.text();

    this.setState({ config: text });
  };

  loadEditors = () => {
    const { config } = this.state;

    const docConfig = JSON.parse(config);

    console.log("doc cfg:");
    console.log(docConfig);

    docConfig.width = "100%";
    docConfig.height = "100%";
    new window.DocsAPI.DocEditor('iframeContainer', docConfig);
  };
  
  render() {
    const { config } = this.state;

    return (
      <>
        <div className="viewer-component">
          {/* {config ? <span>{config}</span> : <span>Select Document</span>} */}
          <div id="iframeContainer"></div>
        </div>
      </>
    );
  }
}
