import React, { Component } from 'react'
import './TemplateBuilder.css'
import ReactQuill from 'react-quill';
import EditorToolbar, { modules, formats } from "../../PluggedComponents/EditorToolbar/EditorToolbar";
import Button from '../../PluggedComponents/Button/Button';
import Icons from '../../icons/Icons';
import 'react-quill/dist/quill.snow.css';
import ITEmplateDocument from '../../models/templateDocument.interface';
import GobalFunctions from '../../GobalFunctions';
//mongodb-data-api
import MongoDBService from '../../mongodb-service/data-api'

interface TemplateBuilderProps {
    goToControlPanel: (a: string) => void
}

interface TemplateBuilderState {
  templates: ITEmplateDocument[],
  currentTemplateIndex: number,
  name: string,
  subject: string,
  message: string,
  searchByParam: string,
  showControls: boolean,
  showButtons: boolean,
  showSearchDialog: boolean,
  isFieldReadOnly: boolean,
  action: 'create-template' | 'update-template' | 'delete-template' | ''
}

export default class TemplateBuilder extends Component <TemplateBuilderProps, TemplateBuilderState> {
  constructor(props: TemplateBuilderProps) {
    super(props)
    //form methods
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleFormReset = this.handleFormReset.bind(this);
    this.validateData = this.validateData.bind(this);
    this.handleInputOnChange = this.handleInputOnChange.bind(this);
    this.handleReactQuilChange = this.handleReactQuilChange.bind(this);
    //buttons
    this.actionCreateTemplate = this.actionCreateTemplate.bind(this);
    this.actionUpdateTemplate = this.actionUpdateTemplate.bind(this);
    this.actionDeleteTemplate = this.actionDeleteTemplate.bind(this);
    this.previousDoc = this.previousDoc.bind(this);
    this.openSearchDialog = this.openSearchDialog.bind(this);
    this.nextDoc = this.nextDoc.bind(this);
    //general methods
    this.createTemplate = this.createTemplate.bind(this)
    this.editTemplate = this.editTemplate.bind(this)
    this.deleteTemplate = this.deleteTemplate.bind(this)
    this.createLinkList = this.createLinkList.bind(this)
    this.jumpTo = this.jumpTo.bind(this);
    
    const templates = JSON.parse(sessionStorage.getItem("templates")!) as ITEmplateDocument[]
    this.state = {
        templates,
        currentTemplateIndex: 0,
        name: templates[0].name,
        subject: templates[0].subject,
        message: templates[0].message,
        showButtons: true,
        showControls: false,
        showSearchDialog: false,
        isFieldReadOnly: true,
        action: '',
        searchByParam: '',
    }
  }
  async handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();

    var form = event.currentTarget as HTMLFormElement;
    var button_text = document.querySelector("button[type=submit] span")!;
    var waitting_block = document.createElement("div");

    if(!this.validateData(this.state.name, this.state.subject, this.state.message)) return;

    waitting_block.classList.add("waiting-screen-transparent");
    document.body.append(waitting_block);
    button_text.innerHTML = "Please wait...";

    switch(this.state.action) {
      case 'create-template': await this.createTemplate(); break;
      case 'update-template': await this.editTemplate(); break;
      case 'delete-template': await this.deleteTemplate(); break;
      default: break;
    }

    button_text.innerHTML = "Submit";
    waitting_block.remove()
  }
  handleFormReset(event: React.FormEvent) {
    event.preventDefault();
    this.setState({
      name: this.state.templates[this.state.currentTemplateIndex].name,
      subject: this.state.templates[this.state.currentTemplateIndex].subject,
      message: this.state.templates[this.state.currentTemplateIndex].message,
      showControls: false,
      showButtons: true,
      isFieldReadOnly: true,
      action: '',
    })
  }
  validateData(name: string, subject: string, message: string) {
    if(name === '') {
      alert("Fill out 'Template name' field!");
      return false;
    }
    if(subject === '') {
      alert("Fill out 'Subject' field!");
      return false;
    }
    if(message.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      alert("Fill out 'Message' field!");
      return false;
    }

    return true;
  }
  handleInputOnChange(event: React.ChangeEvent) {
    var input: HTMLInputElement = event.target as HTMLInputElement;
    var value = input.value;
    var key = input.name;
    
    switch(key) {
      case 'name': 
        this.setState({
          name: value
        });
        break;
      case 'subject':
        this.setState({
          subject: value
        });
        break;
      case 'search-by':
        this.setState({
          searchByParam: value
        });
        break
      default: break;
    }
  }
  handleReactQuilChange(value: string) {
    this.setState({
        message: value
    })
  }
  actionCreateTemplate() {
    this.setState({
        showControls: true,
        showButtons: false,
        isFieldReadOnly: false,
        action: 'create-template',
        name: '',
        subject: '',
        message: ''
    })
  }
  actionUpdateTemplate() {
    this.setState({
        showControls: true,
        showButtons: false,
        isFieldReadOnly: false,
        action: 'update-template',
    })
  }
  actionDeleteTemplate() {
    this.setState({
        showControls: true,
        showButtons: false,
        action: 'delete-template'
    })
  }
  previousDoc() {
    var previousTemplateIndex = this.state.currentTemplateIndex - 1;
    var templates = this.state.templates;

    if(previousTemplateIndex < 0) previousTemplateIndex = templates.length - 1;

    this.setState({
      currentTemplateIndex: previousTemplateIndex,
      name: templates[previousTemplateIndex].name,
      subject: templates[previousTemplateIndex].subject,
      message: templates[previousTemplateIndex].message,
    })
  }
  openSearchDialog(){
    this.setState({
      showSearchDialog: true
    })
  }
  nextDoc() {
    var nextTemplateIndex = this.state.currentTemplateIndex + 1;
    var templates = this.state.templates;

    if(nextTemplateIndex >= templates.length) nextTemplateIndex = 0;

    this.setState({
      currentTemplateIndex: nextTemplateIndex,
      name: templates[nextTemplateIndex].name,
      subject: templates[nextTemplateIndex].subject,
      message: templates[nextTemplateIndex].message,
    })
  }
  async createTemplate() {
    try {
      var template: ITEmplateDocument = {
        name: this.state.name,
        subject: this.state.subject,
        message: this.state.message,
      }

      if(GobalFunctions.doesTemplateExist(this.state.templates, template)) {
        alert(`Template "${template.name}" aleready exists!`);
        throw `Template "${template.name}" aleready exists!`
      }

      var insertedID: string = await MongoDBService.Template.insertDocument(template);

      if(!(!!insertedID)) {
        var message = "Some unexpected error has occured!\nOpen developer tools and contact developer\nTo open developer tools Right click -> Inspect";
        alert(message);
        throw message;
      }

      template._id = insertedID;
      var temps = [...this.state.templates, template];
      this.setState({
        templates: temps,
        currentTemplateIndex: temps.length - 1,
        name: template.name,
        subject: template.subject,
        message: template.message,
        showControls: false,
        showButtons: true,
        isFieldReadOnly: true,
        action: '',
      })
    } catch (error) {
      console.error(error)
    }
  }
  async editTemplate() {
    var temps = [...this.state.templates];
    var template: ITEmplateDocument = {
      _id: temps[this.state.currentTemplateIndex]._id,
      name: this.state.name,
      subject: this.state.subject,
      message: this.state.message,
    }
    var currentTemplateIndex = this.state.currentTemplateIndex;

    try {
      temps.splice(currentTemplateIndex, 1);

      if(GobalFunctions.doesTemplateExist(temps, template)) {
        alert(`Template "${template.name}" aleready exists!`);
        throw `Template "${template.name}" aleready exists!`
      }
      
      var isSuccess = await MongoDBService.Template.updateDocument(template);
      
      if(!isSuccess) {
        var message = "Some unexpected error has occured!\nOpen developer tools and contact developer\nTo open developer tools Right click -> Inspect";
        alert(message);
        throw message;
    }
    temps.splice(currentTemplateIndex, 0, template)
    this.setState({
      templates: temps,
      name: template.name,
      subject: template.subject,
      message: template.message,
      showControls: false,
      showButtons: true,
      isFieldReadOnly: true,
      action: '',
    })
    } catch (error) {
      console.error(error);
      
    }
  }
  async deleteTemplate() {
    try {
      var temps = [...this.state.templates];
      var template: ITEmplateDocument = {
        _id: temps[this.state.currentTemplateIndex]._id,
        name: this.state.name,
        subject: this.state.subject,
        message: this.state.message,
      }
      var currentTemplateIndex = this.state.currentTemplateIndex;
      var isSuccess = await MongoDBService.Template.deleteDocument(template);
      console.log(`isSuccess: ${isSuccess}`);
      
      if(!isSuccess) {
          var message = "Some unexpected error has occured!\nOpen developer tools and contact developer\nTo open developer tools Right click -> Inspect";
          alert(message);
          throw message;
      }
      temps.splice(currentTemplateIndex, 1);
      currentTemplateIndex = currentTemplateIndex < temps.length ? currentTemplateIndex : 0
      template = temps[currentTemplateIndex];
      this.setState({
        currentTemplateIndex,
        templates: temps,
        name: template.name,
        subject: template.subject,
        message: template.message,
        showControls: false,
        showButtons: true,
        isFieldReadOnly: true,
        action: '',
      })
    } catch (error) {
      console.error(error);
      
    }
  }
  createLinkList(): Array<React.ReactNode> {
    var linkList: Array<React.ReactNode> = [];
    this.state.templates.forEach((item, index) => {
      let regex = new RegExp(`.*${this.state.searchByParam.toLowerCase()}.*`);
      if(regex.test(item.name.toLocaleLowerCase())){
        linkList.push(<a href='#' 
          id={index.toString()} 
          key={item._id!}
          onClick={this.jumpTo}
        >
          {item.name}
        </a>);
      }
    })

    return linkList;
  }
  jumpTo(event: React.MouseEvent) {
    event.preventDefault();
    var a = event.currentTarget as HTMLAnchorElement;
    var id = Number(a.id);
    var temp = this.state.templates[id];

    this.setState({
      currentTemplateIndex: id,
      name: temp.name,
      subject: temp.subject,
      message: temp.message,
      searchByParam: '',
      showSearchDialog: false
    })
  }
  componentWillUnmount(): void {
    sessionStorage.setItem("templates", JSON.stringify(this.state.templates))
  }
  render() {
    return (
      <div className='template-builder'>
        <div className='header'>
            <span>{'Template Builder'}</span>
            <button type='button' onClick={() => {this.props.goToControlPanel('')}}><span>&#10005;</span></button>
        </div>
        <form className='data-manipulator'
          onSubmit={this.handleFormSubmit}
          onReset={this.handleFormReset}
        >
          <div className="data-fields">
            <label htmlFor="template-name">
              <span>{'Template name:'}</span>
              <input 
                name='name' 
                className='field' 
                type="text" 
                value={this.state.name} 
                onChange={this.handleInputOnChange}
                readOnly={this.state.isFieldReadOnly}
              />
            </label>
            <label htmlFor="template-subject">
              <span>{'Subject:'}</span>
              <input 
                name='subject' 
                className='field' 
                type="text" 
                value={this.state.subject} 
                onChange={this.handleInputOnChange}
                readOnly={this.state.isFieldReadOnly}
              />
            </label>
            <label htmlFor="">
              <span>{'Message:'}</span>
              <div className='text-editor'>
                <ReactQuill
                  theme="snow"
                  value={this.state.message}
                  onChange={this.handleReactQuilChange}
                  modules={modules}
                  formats={formats}
                  readOnly={this.state.isFieldReadOnly}
                />
                <EditorToolbar />
              </div>
            </label>
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
                    text="New template"
                    iconPath={Icons.newDocument}
                    onClick={this.actionCreateTemplate}
                ></Button>
                <Button
                    className='update'
                    type='button'
                    text="edit template"
                    iconPath={Icons.editDocument}
                    onClick={this.actionUpdateTemplate}
                ></Button>
                <Button
                    className='delete'
                    type='button'
                    text="delete template"
                    iconPath={Icons.deleteDocument}
                    onClick={this.actionDeleteTemplate}
                ></Button>
                <Button
                    className='previous-next'
                    type='button'
                    text="previous template"
                    iconPath={Icons.previousDocument}
                    onClick={this.previousDoc}
                ></Button>
                <Button
                    className='search'
                    type='button'
                    text="search templates"
                    iconPath={Icons.search}
                    onClick={this.openSearchDialog}
                ></Button>
                <Button
                    className='previous-next'
                    type='button'
                    text="next template"
                    iconPath={Icons.nextDocument}
                    onClick={this.nextDoc}
                ></Button>
            </div>
        </form>
        <div className="search-modal-overlay" style={{display: this.state.showSearchDialog ? 'flex' : 'none'}}>
          <div className="search-body">
            <input 
              type="text" 
              name='search-by' 
              id='search-by' 
              list='temp-names' 
              value={this.state.searchByParam}
              onChange={this.handleInputOnChange}
            />
            <datalist id='temp-names'>{this.state.templates.map((temp) => {
              return <option key={temp._id!} value={temp.name}></option>
            })}</datalist>
            {this.createLinkList()}
          </div>
        </div>
      </div>
    )
  }
}
