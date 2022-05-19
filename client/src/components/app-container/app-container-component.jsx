import React from "react";
import mondaySdk from "monday-sdk-js";
import "./app-container-component.scss";
import DocumentListComponent from "../doclist/doclist-component";
import ViewerComponent from "../viewer/viewer-component";
const monday = mondaySdk();

export default class AppContainerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { boards: [], docs: [], filteredDocs: [], selectedItem: null, searchTerm: "" };
  }

  async componentDidUpdate(prevProps) {
    const { context } = this.props;
    if (context.boardIds !== prevProps.context.boardIds) {
      await this.fetchBoards(context.boardIds);
    }
  }

  fetchBoards = async (ids) => {
    const { context } = this.props;

    console.log("ctx.appcont");
    console.log(context);
    const res = await monday
      .api(
        `
        query {
          boards(ids:[${ids}]) {
            id
            name

            items {
              id
              name

              assets {
                id
                name
              }
            }
          }
        } 
        `
      ); // items_by_column_values 

    console.log("brds: ");
    console.log(res.data);

    const docs = [];

    for(let i = 0; i < res.data.boards.length; i++) {
      let board = res.data.boards[i];
      for (let j = 0; j < board.items.length; j++) {
        let item = board.items[j];
        if (!item.assets.length) continue;
        
        for (let k = 0; k < item.assets.length; k++) {
          let asset = item.assets[k];
          docs.push({ id: asset.id, name: asset.name, itemId: item.id, boardId: board.id, url: "#", type: "OTHER" });
        }
      }
    }

    console.log("docs: ");
    console.log(docs);

    this.setState({ boards: res.data.boards, docs: docs, filteredDocs: docs });
  };

  fetchDocs = async () => {
    // const { selectedItem, searchTerm } = this.state;
    // const docs = await getDocs();
    // const filteredDocs = await getDocs(searchTerm);
    // const newSelectedItem = selectedItem || docs.length > 0 ? docs[0] : null;
    // this.setState({ docs, filteredDocs, selectedItem: newSelectedItem });
  };

  onFilterTermChange = (searchTerm) => {
    // this.setState({ searchTerm }, async () => {
    //   await this.fetchBoards();
    // });
  };

  onClick = (item) => {
    this.setState({ selectedItem: item });
  };

  render() {
    const { docs, filteredDocs, selectedItem, searchTerm } = this.state;
    const selectedItemId = selectedItem ? selectedItem.id : -1;

    return (
      <div className="app-container-component">
        <ViewerComponent item={selectedItem} />
        <DocumentListComponent
          selectedItemId={selectedItemId}
          docs={docs}
          filteredDocs={filteredDocs}
          onClick={this.onClick}
          onFilterTermChange={this.onFilterTermChange}
          searchTerm={searchTerm}
        />
      </div>
    );
  }
}
