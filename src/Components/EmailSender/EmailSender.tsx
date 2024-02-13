import React, { Component } from 'react'
import './EmailSender.css'
//icons
import Icons from '../../icons/Icons'
//texteditor
import ReactQuill from 'react-quill';
import EmailSenderToolbar, { modules, formats } from "../../PluggedComponents/EmailSenderToolbar/EmailSenderToolbar";
//doc models
import IClientDocument from '../../models/clientDocument.interface';
import ITEmplateDocument from '../../models/templateDocument.interface';
//mongo services
import clientApi from '../../mongodb-service/client-api';

interface EmailSenderProps {
    goToControlPanel: (a: string) =>  void,
}

interface EmailSenderState {
    clients: IClientDocument[],
    templates: ITEmplateDocument[],
    currentChosenClient: IClientDocument,
    currentChosenClientID: number,
    to: string,
    subject: string,
    message: string,
    showSearchDialog: boolean,
    showClientInfoDialog: boolean,
    searchByParam: string,
}

export default class EmailSender extends Component<EmailSenderProps, EmailSenderState> {
  constructor(props: EmailSenderProps) {
    super(props)

    this.handleToOnchange = this.handleToOnchange.bind(this);
    this.handleSubjectOnChange = this.handleSubjectOnChange.bind(this);
    this.handleEditorOnChange = this.handleEditorOnChange.bind(this);
    this.handleSearchByChange = this.handleSearchByChange.bind(this);
    this.createLinkList = this.createLinkList.bind(this);
    this.openInsertTemplateDialog = this.openInsertTemplateDialog.bind(this);
    this.insertTemplate = this.insertTemplate.bind(this);
    this.toggleClientInfoDialog = this.toggleClientInfoDialog.bind(this);
    this.sendEmail = this.sendEmail.bind(this)

    const clients = JSON.parse(sessionStorage.getItem("clientDocs")!) as IClientDocument[];
    const templates = JSON.parse(sessionStorage.getItem("templates")!) as ITEmplateDocument[];
    this.state = {
        clients,
        templates,
        to: '',
        subject: '',
        message: '',
        showSearchDialog: false,
        searchByParam: '',
        showClientInfoDialog: false,
        currentChosenClient: {
            email: '',
            full_name: '',
            company: '',
            website: '',
            notes: ''
        },
        currentChosenClientID: -1,
    }
  }
  handleToOnchange(event: React.ChangeEvent) {
    var email = (event.target as HTMLInputElement).value;
    var client: IClientDocument = {
        email: '',
        full_name: '',
        company: '',
        website: '',
        notes: ''
    };
    var client_index = -1;

    for(const index in this.state.clients) {
        var item: IClientDocument = this.state.clients[index];
        if(item.email === email) {
            client = {...item};
            client_index = Number(index);
            break;
        }
    }

    this.setState({
        to: (event.target as HTMLInputElement).value,
        currentChosenClient: client,
        currentChosenClientID: client_index,
    });
  }
  handleSubjectOnChange(event: React.ChangeEvent) {
    this.setState({
        subject: (event.target as HTMLInputElement).value
    })
  }
  handleEditorOnChange(value: string) {
    this.setState({
        message: value
    })
  }
  handleSearchByChange(event: React.ChangeEvent) {
    this.setState({
        searchByParam: (event.target as HTMLInputElement).value
    })
  }
  createLinkList(): Array<React.ReactNode> {
    var linkList: Array<React.ReactNode> = [];
    this.state.templates.forEach((item, index) => {
      let regex = new RegExp(`.*${this.state.searchByParam.toLowerCase()}.*`);
      if(regex.test(item.name.toLocaleLowerCase())){
        linkList.push(<a href='#' 
          id={index.toString()} 
          key={item._id!}
          onClick={this.insertTemplate}
        >
          {item.name}
        </a>);
      }
    })

    return linkList;
  }
  openInsertTemplateDialog() {
    this.setState({
        showSearchDialog: true
    })
  }
  insertTemplate(event: React.MouseEvent) {
    event.preventDefault();
    var a = event.target as HTMLAnchorElement;
    var id = Number(a.id!);
    var client = this.state.currentChosenClient;
    var template = this.state.templates[id];
    var subject = template.subject;
    var message = template.message;

    message = message.replaceAll("{{email}}", client.email).replaceAll("{{full_name}}", client.full_name).replaceAll("{{company}}", client.company)

    this.setState({
        subject,
        message,
        showSearchDialog: false
    })
  }
  toggleClientInfoDialog() {
    this.setState({
        showClientInfoDialog: !this.state.showClientInfoDialog
    })
  }
  async sendEmail(): Promise<void> {
    try {
        const webhook = `https://hook.eu2.make.com/eixhenwq6wh8p4euew61x4ms3c2sxj8s`;
        var to = this.state.to;
        var subject = this.state.subject;
        var message = this.state.message;

        if(to === '') {
            alert("Please choose an email!");
            throw "Please choose an email!";
        }
        if(subject === '') {
            alert("Please write a subject!");
            throw "Please write a subject!"
        }
        if(message.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
            alert("Please write a message!");
            throw "Please write a subject!"
        }
        var data = new FormData();
        data.append("to", to);
        data.append("subject", subject);
        data.append("message", message)
        var response = await fetch(webhook, {
            method: "POST",
            body: data
        })
        if(!response.ok) {
          alert("Some unexpected error has occured!\nOpen dev tools and contact developer!");
          console.error(response);
        }
        var currentChosenClient = this.state.currentChosenClient;
        var currentChosenClientID = this.state.currentChosenClientID
        var clients = this.state.clients
        if(currentChosenClient.sent_emails === undefined) currentChosenClient.sent_emails = '1';
        else currentChosenClient.sent_emails = (Number(currentChosenClient.sent_emails!) + 1).toString();

        clientApi.updateDocument(currentChosenClient);
        clients.splice(currentChosenClientID, 1, currentChosenClient)
        this.setState({
          clients,
          currentChosenClient: {
            email: '',
            full_name: '',
            company: '',
            website: '',
            notes: '',
          },
          currentChosenClientID: -1,
          to: '',
          subject: '',
          message: ''
        }, () => console.log(this.state.clients))
    } catch (error) {
      alert("Some unexpected error has occured!\nOpen dev tools and contact developer!");
      console.error(error);
    }
  }
  render() {
    return (
      <div className='email-sender'>
        <div className='header'>
            <span>{'Email Sender'}</span>
            <button type='button' onClick={() => {this.props.goToControlPanel('')}}><span>&#10005;</span></button>
        </div>
        <label htmlFor="to">
            <span>{'To:'}</span>
            <div id='client-email-container' className='field'>
                <input 
                    name='to' 
                    type='text' 
                    list='client-emails'
                    value={this.state.to} 
                    onChange={this.handleToOnchange}
                />
                <img src={Icons.info} onClick={this.toggleClientInfoDialog}></img>
            </div>
            <datalist id='client-emails'>{this.state.clients.map((item) => {
                if(item.sent_emails == '0') return <option key={item._id!} value={item.email}>{`${item.full_name} | ${item.company}`}</option>
                
                else return <></>
            })}</datalist>
        </label>
        <label htmlFor="">
            <span>{'Subject:'}</span>
            <input 
                className='field'
                name='subject' 
                type="text" 
                value={this.state.subject}
                onChange={this.handleSubjectOnChange}
            />
        </label>
        <label id='text-editor-container' htmlFor="">
            <span>{'Message:'}</span>
              <div className='text-editor'>
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={this.state.message}
                  onChange={this.handleEditorOnChange}
                />
                <EmailSenderToolbar
                    openInsertTemplateDialog={this.openInsertTemplateDialog}
                    sendEmail={this.sendEmail}
                ></EmailSenderToolbar>
              </div>
        </label>
        <div className="search-modal-overlay" style={{display: this.state.showSearchDialog ? 'flex' : 'none'}}>
          <div className="search-body">
            <input 
              type="text" 
              name='search-by' 
              id='search-by' 
              list='temp-names' 
              value={this.state.searchByParam}
              onChange={this.handleSearchByChange}
            />
            <datalist id='temp-names'>{this.state.templates.map((temp) => {
              return <option key={temp._id!} value={temp.name}></option>
            })}</datalist>
            {this.createLinkList()}
          </div>
        </div>
        <div className="search-modal-overlay" style={{display: this.state.showClientInfoDialog ? 'flex' : 'none'}}>
          <div className="search-body" style={{margin: 'auto'}}>
            {
                this.state.currentChosenClient.email === '' ?
                <a style={{color: '#131313'}}>{'Client does not exist!'}</a> :
                <table>
                    <tr>
                        <th>{'Email:'}</th>
                        <td>{this.state.currentChosenClient.email}</td>
                    </tr>
                    <tr>
                        <th>{'Full name:'}</th>
                        <td>{this.state.currentChosenClient.full_name}</td>
                    </tr>
                    <tr>
                        <th>{'Company:'}</th>
                        <td>{this.state.currentChosenClient.company}</td>
                    </tr>
                    <tr>
                        <th>{'Website:'}</th>
                        <td><a style={{color: '#131313'}} href={this.state.currentChosenClient.website} target='_blank'>{'Chek it...'}</a></td>
                    </tr>
                    <tr>
                        <th colSpan={2}>{'Notes:'}</th>
                    </tr>
                    <tr>
                        <td colSpan={2}>{this.state.currentChosenClient.notes}</td>
                    </tr>
                </table>
            }
            <button onClick={this.toggleClientInfoDialog}>Close</button>
          </div>
        </div>
      </div>
    )
  }
}
