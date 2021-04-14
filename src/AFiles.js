// Files UI implementation
import { Component } from 'react';
import FileInterfaces from './FileInterfaces';
import AFilesEdit from './AFilesEdit';
import Utils from './Utils';
import './AFiles.css';

// Table header names
var files_titles = [
  'Name',
  'Type',
  'Location',
  'ID',
  ' ',
  ' ',
];

class AFiles extends Component {
  constructor(props) {
    super(props);

    this.addItem = this.addItem.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.deleteitem = this.deleteItem.bind(this);
    this.displayError = this.displayError.bind(this);
    this.editItem = this.editItem.bind(this);
    this.finishAdd = this.finishAdd.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.nameCheck = this.nameCheck.bind(this);
    this.updateNewType = this.updateNewType.bind(this);

    this.file_interfaces = FileInterfaces.getFileInterfaceTypes();

    let files_list = this.props.files();
    if (!files_list) {
      files_list = [];
    }

    this.state = {
      mode: null,
      mode_name: '',
      mode_title: '',
      mode_path: '/',
      edit_add: true,
      edit_item: null,
      files_list,
    }
  }

  new_type_id = null;

  addItem(ev) {
    if (!this.new_type_id) {
      let el = document.getElementById('files_types');
      el.focus();
      return;
    }
    const cur_mode = this.new_type_id;
    let cur_mode_name = FileInterfaces.findById(cur_mode);
    if (cur_mode_name) {
      cur_mode_name = cur_mode_name.prompt;
    } else {
      cur_mode_name = '';
    }
    this.setState({mode: cur_mode, mode_name: cur_mode_name, mode_title: 'New ' +  cur_mode_name, mode_path: '/', edit_cb: this.finishAdd, 
                   edit_add: true, edit_item: null});
  }

  cancelEdit(edit_id) {
    if ('' + this.state.mode === '' + edit_id) {
      this.setState({mode: null, mode_name: '', mode_title: ''});
    }
  }

  deleteItem(ev, item_id) {
    let found_item = this.state.files_list.find((item) => item.id === item_id);
    if (!found_item) {
      this.displayError('Internal error prevented the removal of the entry');
      console.log('Unable to delete entry with ID: ', item_id);
      return;
    }

    if (this.props.hasOwnProperty('deleteFile')) {
      this.props.deleteFile(found_item.id);
      this.setState({'files_list': this.props.files()});
    }
  }

  displayError(msg) {
  }

  editItem(ev, item_id) {
    console.log("Edit " + this.new_type_id);
    let found_item = this.state.files_list.find((item) => item.id === item_id);
    if (!found_item) {
      this.displayError('Internal error prevented editing of this entry');
      console.log('Unable to edit entry with ID: ', item_id);
      return;
    }

    console.log("ITEM:", found_item);
    this.setState({mode: found_item.data_type, name: found_item.name, mode_title: 'Edit ' +  found_item.name, 
                   mode_path: found_item.location, edit_cb: this.finishEdit, edit_add: false, edit_item: found_item});
  }

  finishAdd(edit_type, name, path, auth) {
    let new_state = {mode: null, mode_name: '', mode_title: ''};

    const new_entry = {name, location: path, auth, data_type: edit_type, id: Utils.getUuid()};
    this.props.addFile(new_entry);
    new_state['files_list'] = this.props.files();

    this.setState(new_state);
  }

  finishEdit(edit_type, name, path, auth, item_id) {
    let new_state = {mode: null, mode_name: '', mode_title: ''};

    const new_entry = {name, location: path, auth, data_type: edit_type, id: item_id};
    const old_entry = this.state.files_list.find((item) => item.id === item_id);
    this.props.updateFile(old_entry.id, new_entry);
    new_state['files_list'] = this.props.files();

    this.setState(new_state);
  }

  getTitle(item, idx) {
    if (item && (item.length > 0) && (item[0] !== '_')) {
      if (item !== ' ') {
        return (<th id={"title_" + idx} key={item} className="files-title-text">{item}</th>);
      } else {
        return (<th id={"title_" + idx} key={item + '_' + idx}></th>);
      }
    }
    return null;
  }

  nameCheck(name) {
    const found_item = this.state.files_list.find((item) => item.name === name);
    console.log("FOUND:", name, found_item);
    if (this.state.edit_add) {
      console.log("ADD");
      return found_item === undefined;
    } else {
      console.log("EDIT");
      return found_item !== undefined;
    }
  }

  updateNewType(ev) {
    this.new_type_id = ev.target.value;
  }

  render()  {
    return (
      <>
        <div id="files_wrapper" className="files-wrapper">
          <div id="files_header" className="files-header">
            <div id="files_header_text" className="files-header-text">
              Connect to files stored in a heirarchy
            </div>
            <div className="files-header-fill">&nbsp;</div>
            <div id="files_types_add_new_wrapper" className="files-types-add-new-wrapper">
              <div id="files_types_list_wrapper" className="files-types-list-wrapper">
                <select name="files_types" id="files_types" onChange={this.updateNewType}>
                  <option value="" className="files-types-option files-type-option-select">--Please select--</option>
                  {this.file_interfaces.map((item) => {return (<option value={item.id} key={item.id} className="files-types-options files-types-option-item">{item.name}</option>);}
                  )}
                </select>
              </div>
              <div id="files_add_new_button_wrapper" className="files-add-new-button-wrapper">
                <span id="add_new_button" className="files-add-new-button" onClick={this.addItem}>New</span>
              </div>
            </div>
          </div>
          <table id="files_table" className="files-table">
            <thead className="files-table-titles">
              <tr>
                {files_titles.map(this.getTitle)}
              </tr>
            </thead>
            <tbody>
              {this.state.files_list.map((item) => {
                return (
                  <tr id={'files_detail_row_' + item.id} key={item.id} className="files-detail-row">
                    <td id={'files_detail_name_' + item.id} className="files-detail-item files-detail-name">{item.name}</td>
                    <td id={'files_detail_type_' + item.id} className="files-detail-item files-detail-type">{item.data_type}</td>
                    <td id={'files_detail_loc_' + item.id} className="files-detail-item files-detail-location">{item.location}</td>
                    <td id={'files_detail_id_' + item.id} className="files-detail-item files-detail-id">{item.id}</td>
                    <td id={'files-detail_edit_' + item.id} className="files-detail-item files-detail-edit" onClick={(ev) => this.editItem(ev, item.id)}>Edit</td>
                    <td id={'files-detail_del_' + item.id} className="files-detail-item files-detail-delete" onClick={(ev) => this.deleteItem(ev, item.id)}>Delete</td>
                  </tr>
                ); 
              })}
            </tbody>
          </table>
        </div>
        {this.state.mode !== null &&
            <AFilesEdit title={this.state.mode_title} source={this.state.mode} path={this.state.mode_path} edit_item={this.state.edit_item}
                        cancel={this.cancelEdit} submit={this.state.edit_cb} name_check={this.nameCheck} />}
      </>
      );
  }
}

export default AFiles;