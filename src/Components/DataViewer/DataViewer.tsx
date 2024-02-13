import React, { Component, FormEvent } from 'react'
import './DataViewer.css'
//global functions
import GF from '../../GobalFunctions';
//mongodb-data-api
import MongoDBService from '../../mongodb-service/data-api'
//plugged components
import Button from '../../PluggedComponents/Button/Button';
//models
import IClientDocument from '../../models/clientDocument.interface'
//icons
import Icons from '../../icons/Icons';
interface DataViewerProps {
    goToControlPanel: (a: string) => void;
}
interface DataViewerState {
    showControls: boolean,
    showButtons: boolean,
    showHideData: boolean,
    clientDocs: IClientDocument[],
    isFieldReadOnly: boolean,
    selected_doc: IClientDocument,
    selected_index: number,
    form_values: IClientDocument,
    action: 'create-client-doc' | 'update-client-doc' | 'delete-client-doc' | ''
}

export default class DataViewer extends Component<DataViewerProps, DataViewerState> {
  constructor(props: DataViewerProps) {
    super(props);

    //form methods
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleFormReset = this.handleFormReset.bind(this);
    this.handleInputOnChange = this.handleInputOnChange.bind(this);
    this.validateData = this.validateData.bind(this);
    //jump to
    this.jumpTo = this.jumpTo.bind(this);
    //buttons
    this.actionNewClientDoc = this.actionNewClientDoc.bind(this);
    this.actionUpdateClientDoc = this.actionUpdateClientDoc.bind(this);
    this.actionDeleteClientDoc = this.actionDeleteClientDoc.bind(this);
    this.previousDoc = this.previousDoc.bind(this);
    this.nextDoc = this.nextDoc.bind(this);
    this.showHideData = this.showHideData.bind(this);
    //general methods
    this.createClientDocument = this.createClientDocument.bind(this);
    this.editClientDocument = this.editClientDocument.bind(this);
    this.deleteClientDocument = this.deleteClientDocument.bind(this);

    const clientDocs = JSON.parse(sessionStorage.getItem("clientDocs")!) as IClientDocument[]
    this.state = {
        clientDocs,
        showHideData: false,
        showButtons: true,
        showControls: false,
        isFieldReadOnly: true,
        action: '',
        selected_doc: clientDocs[0],
        selected_index: 0,
        form_values: {
            email: clientDocs[0].email,
            full_name: clientDocs[0].full_name,
            company: clientDocs[0].company,
            website: clientDocs[0].website,
            notes: clientDocs[0].notes
        },
    }
  }
  async handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();

    var form = event.currentTarget as HTMLFormElement;
    var button_text = document.querySelector("button[type=submit] span")!;
    
    var waitting_block = document.createElement("div");
    var can_reset = false;

    if(this.state.action == 'create-client-doc' || this.state.action == 'update-client-doc') {
        var isValid = this.validateData(this.state.form_values);
        
        if(!isValid) {
            return
        };
    }

    waitting_block.classList.add("waiting-screen-transparent");
    document.body.append(waitting_block);
    button_text.innerHTML = "Please wait...";
    
    switch(this.state.action) {
        case 'create-client-doc': can_reset = await this.createClientDocument(); break;
        case 'update-client-doc': can_reset = await this.editClientDocument(); break;
        case 'delete-client-doc': can_reset = await this.deleteClientDocument(); break;
        default: break;
    };
    waitting_block.remove();
    button_text.innerHTML = "Submit";

    this.setState({
        showControls: false,
        showButtons: true,
        isFieldReadOnly: true,
        action: '',
    })
  }
  handleFormReset(event: React.FormEvent) {
    event.preventDefault();
    var form_values = {...this.state.selected_doc}
    this.setState({
        showControls: false,
        showButtons: true,
        isFieldReadOnly: true,
        action: '',
        form_values
    })
  }
  handleInputOnChange(event: React.ChangeEvent) {
    var form_values: any = {...this.state.form_values}
    var input: HTMLInputElement = event.target as HTMLInputElement;
    var value = input.value;
    var key = input.name;
    form_values[key] = value;
    this.setState({
        form_values
    })
  }
  validateData(data: IClientDocument): boolean {
    var email_reg_exp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    var full_name_reg_exp = /^[A-Za-zČčĆćŽžŠšĐđ\s]+$/    ;

    if(data.email === '') {
        alert("'Email field must not be empty'");
        return false;
    }
    if(!email_reg_exp.test(data.email)) {
        alert("Email is not in the right format!");
        return false;
    }

    
    if(data.full_name === '') {
        alert("Please fill out 'Full name' field!");
        return false;
    }
    if(!full_name_reg_exp.test(data.full_name)) {
        alert("Please, use only letters and spaces when writing in field 'Full name'");
        return false;
    }

    if(data.company === '') {
        alert("Please fill out 'Company' field!");
        return false;
    }

    if(data.website === '') {
        alert("Please fill out 'Website' field!\nIf client doesn't have a website, write n/a");
        return false;
    }

    if(data.notes === '') {
        alert("Please fill out 'Notes' field!");
        return false;
    }

    return true;
  }
  //jump to
  jumpTo(event: React.ChangeEvent) {
    var select = event.currentTarget as HTMLSelectElement;
    var selected_index = select.selectedIndex;
    var selected_doc = this.state.clientDocs[selected_index];
    this.setState({
        selected_doc,
        selected_index,
        form_values: selected_doc
    })
  }
  //button functions
  actionNewClientDoc() {
    this.setState({
        showControls: true,
        showButtons: false,
        isFieldReadOnly: false,
        action: 'create-client-doc',
        form_values: {
            email: '',
            full_name: '',
            company: '',
            website: '',
            notes: '',
        }
    })
  }
  actionUpdateClientDoc() {
    this.setState({
        showControls: true,
        showButtons: false,
        isFieldReadOnly: false,
        action: 'update-client-doc',
    })
  }
  actionDeleteClientDoc() {
    this.setState({
        showControls: true,
        showButtons: false,
        action: 'delete-client-doc',
    })
  }
  previousDoc() {
    var selected_index = this.state.selected_index - 1;
    var clientDocs = this.state.clientDocs;
    
    if(selected_index < 0) selected_index = clientDocs.length - 1;

    var selected_doc = clientDocs[selected_index];
    
    this.setState({
        selected_doc,
        selected_index,
        form_values: selected_doc
    })
  }
  nextDoc() {
    var selected_index = this.state.selected_index + 1;
    var clientDocs = this.state.clientDocs;
    
    if(selected_index >= clientDocs.length) selected_index = 0;

    var selected_doc = clientDocs[selected_index];
    
    this.setState({
        selected_doc,
        selected_index,
        form_values: selected_doc
    })
  }
  showHideData() {
    this.setState({
        showHideData: !this.state.showHideData
    })
  }
  //general methods
  async createClientDocument(): Promise<boolean> {
    var requestAccepted = true;
    try {
        var clientDoc: IClientDocument = {...this.state.form_values}

        if(GF.doesClientDocumentExist(this.state.clientDocs, clientDoc)) {
            alert(`There is already a client with email ${clientDoc.email}`);
            throw `There is already a client with email ${clientDoc.email}`
        }
        clientDoc.sent_emails = "0";
        var insertedID: string = await MongoDBService.Client.insertDocument(clientDoc);

        if(!(!!insertedID)) {
            var message = "Some unexpected error has occured!\nOpen developer tools and contact developer\nTo open developer tools Right click -> Inspect";
            alert(message);
            throw message;
        }
        clientDoc._id = insertedID;
        clientDoc.sent_emails = '0';

        var new_docs = [...this.state.clientDocs, clientDoc];
        this.setState({
            selected_index: new_docs.length - 1,
            selected_doc: new_docs[new_docs.length - 1],
            form_values: new_docs[new_docs.length - 1],
            clientDocs: new_docs
        })
        requestAccepted = true;
    }
    catch(error: any) {
        console.error(error);
        requestAccepted = false;
    }
    finally {
        return requestAccepted;
    }
  }
  async editClientDocument(): Promise<boolean> {
    var requestAccepted = true;
    try {
        var selected_index = this.state.selected_index
        var clientDoc: IClientDocument = {...this.state.form_values}
        var docs: IClientDocument[] = [...this.state.clientDocs];
        
        docs.splice(selected_index, 1);

        if(GF.doesClientDocumentExist(docs, clientDoc)){
            alert(`There is already a client with email ${clientDoc.email}`);
            throw `There is already a client with email ${clientDoc.email}`
        }
        clientDoc._id = this.state.selected_doc._id;
        var isSuccess = await MongoDBService.Client.updateDocument(clientDoc);
        

        if(!isSuccess) {
            var message = "Some unexpected error has occured!\nOpen developer tools and contact developer\nTo open developer tools Right click -> Inspect";
            alert(message);
            throw message;
        }
        docs.splice(selected_index, 0, clientDoc);
        this.setState({
            form_values: clientDoc,
            selected_doc: clientDoc,
            clientDocs: docs
        })
    }
    catch(error: any) {
        console.error(error);
        requestAccepted = false;
    }
    finally {
        return requestAccepted;
    }
  }
  async deleteClientDocument() {
    var returnState = true;
    try {
        var selected_index = this.state.selected_index;
        var clientDoc = this.state.selected_doc;
        var isSuccess = await MongoDBService.Client.deleteDocument(clientDoc);

        if(!isSuccess) {
            var message = "Some unexpected error has occured!\nOpen developer tools and contact developer\nTo open developer tools Right click -> Inspect";
            alert(message);
            throw message;
        }

        var clientDocs = this.state.clientDocs;
        clientDocs.splice(selected_index, 1);
        selected_index = selected_index < clientDocs.length ? selected_index : 0
        this.setState({
            selected_index,
            form_values: {...clientDocs[selected_index]},
            selected_doc: {...clientDocs[selected_index]},
            clientDocs
        })
    }
    catch(error: any) {
        console.error(error);
        returnState = false;
    }
    finally {
        return returnState;
    }
  }
  componentWillUnmount(): void {
    sessionStorage.setItem("clientDocs", JSON.stringify(this.state.clientDocs))
  }
  render() {
    return (
      <div className='data-viewer'>
        <div className='header'>
            <span>{'Data Viewer'}</span>
            <button type='button' onClick={() => {this.props.goToControlPanel('')}}><span>&#10005;</span></button>
        </div>
        <form className='data-manipulator' onSubmit={this.handleFormSubmit} onReset={this.handleFormReset}>
            <div className="data-fields">
                {/* Jump to*/}
                <label htmlFor="jump-to">Jump to:</label>
                    {/* select will be disabled when a document is being added, edited or deleted */}
                <select 
                    className='form-field' 
                    name="jump-to" 
                    id="jump-to"
                    value={this.state.selected_doc.email} 
                    onChange={this.jumpTo}
                    disabled={!this.state.isFieldReadOnly}
                >{
                    this.state.clientDocs.map((item, index) => {
                        return <option key={index} value={item.email}>{item.email}</option>
                    })
                }</select>
                {/* Email */}
                <label htmlFor="email">email:</label>
                <input className='form-field' type="text" name="email" id="email" onChange={this.handleInputOnChange} value={this.state.form_values.email} readOnly={this.state.isFieldReadOnly} />
                {/* Full name */}
                <label htmlFor="full_name">full name:</label>
                <input className='form-field' type="text" name="full_name" id="full_name" onChange={this.handleInputOnChange} value={this.state.form_values.full_name} readOnly={this.state.isFieldReadOnly} />
                {/* Company */}
                <label htmlFor="company">company:</label>
                <input className='form-field' type="text" name="company" id="company" onChange={this.handleInputOnChange} value={this.state.form_values.company} readOnly={this.state.isFieldReadOnly} />
                {/* Website */}
                <label htmlFor="website">website:</label>
                <input className='form-field' type="text" name="website" id="website" onChange={this.handleInputOnChange} value={this.state.form_values.website} readOnly={this.state.isFieldReadOnly} placeholder='Write n/a if there is no site' />
                {/* Notes */}
                <label htmlFor="notes">notes:</label>
                <input className='form-field' type="text" name="notes" id="notes" onChange={this.handleInputOnChange} value={this.state.form_values.notes} readOnly={this.state.isFieldReadOnly} />
            </div>
            <div className="controls" style={{display: `${this.state.showControls ? 'flex' : 'none'}`}}>
                <Button
                    className='cancel'
                    type='reset'
                    text="Cancel"
                    iconPath={Icons.cancel}
                ></Button>
                <Button
                    className='submit'
                    type='submit'
                    text="Submit"
                    iconPath={Icons.submit}
                ></Button>
            </div>
            <div className='buttons'  style={{display: `${this.state.showButtons ? 'grid' : 'none'}`}}>
                <Button
                    className='new'
                    type='button'
                    text="New document"
                    iconPath={Icons.newDocument}
                    onClick={this.actionNewClientDoc}
                ></Button>
                <Button
                    className='update'
                    type='button'
                    text="edit document"
                    iconPath={Icons.editDocument}
                    onClick={this.actionUpdateClientDoc}
                ></Button>
                <Button
                    className='delete'
                    type='button'
                    text="delete document"
                    iconPath={Icons.deleteDocument}
                    onClick={this.actionDeleteClientDoc}
                ></Button>
                <Button
                    className='previous-next'
                    type='button'
                    text="previous document"
                    iconPath={Icons.previousDocument}
                    onClick={this.previousDoc}
                ></Button>
                <Button
                    className='view-documents'
                    type='button'
                    text="view documents"
                    iconPath={Icons.viewDocument}
                    onClick={this.showHideData}
                ></Button>
                <Button
                    className='previous-next'
                    type='button'
                    text="next document"
                    iconPath={Icons.nextDocument}
                    onClick={this.nextDoc}
                ></Button>
            </div>
        </form>
        <div className="docs" style={{display: this.state.showHideData ? 'block' : 'none'}}>
            <div className='header'>
                <span>{'All documents'}</span>
                <button type='button' onClick={this.showHideData}><span>&#10005;</span></button>
            </div>
            <table className='data'>
                <thead>
                    <tr>
                        <th>{'email'}</th>
                        <th>{'full name'}</th>
                        <th>{'company'}</th>
                        <th>{'website'}</th>
                        <th>{'notes'}</th>
                        <th>{'sent'}</th>
                    </tr>
                </thead>
                <tbody>{
                    this.state.clientDocs.map((item) => {
                        return <tr key={item._id!}>
                            <td>{item.email}</td>
                            <td>{item.full_name}</td>
                            <td>{item.company}</td>
                            <td>{
                                item.website !== 'n/a' 
                                ?
                                <a href={item.website} target='_blank'>{'Go to...'}</a>
                                :
                                'no site'
                            }</td>
                            <td>{item.notes}</td>
                            <td>{item.sent_emails!}</td>
                        </tr>
                    })
                }</tbody>
            </table>
        </div>
      </div>
    )
  }
}
