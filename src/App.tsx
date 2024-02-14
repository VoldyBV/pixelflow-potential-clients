import React, { Component } from 'react'
import Loading_Screen from './Components/Loading_Screen/Loading_Screen'
//monogdb services (this file contains functions to manipulate data in database using mongodb data api)
import MongoDBService from './mongodb-service/data-api'
//models
import IClientDocument from './models/clientDocument.interface'
import ControlPanel from './Components/ControlPanel/ControlPanel'
import DataViewer from './Components/DataViewer/DataViewer'
import TemplateBuilder from './Components/TemplateBuilder/TemplateBuilder'
import EmailSender from './Components/EmailSender/EmailSender'
import Preloader from './PluggedComponents/Preloader/Preloader'

interface AppState {
  isLoadingScreenOn: boolean
  records: IClientDocument[],
  currentComponent: React.ReactNode,
}
interface AppProps {

}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    //methods
    this.openComponent = this.openComponent.bind(this)
    this.state = {
       isLoadingScreenOn: true,
       records: [],
       currentComponent: <ControlPanel openComponent={this.openComponent}></ControlPanel>
    }
  }
  async componentDidMount(): Promise<void> {
    try {
      await MongoDBService.logIn();
      var clientDocs = await MongoDBService.Client.getDocuments();
      var templates = await MongoDBService.Template.getDocuments();
      sessionStorage.setItem("clientDocs", JSON.stringify(clientDocs))
      sessionStorage.setItem("templates", JSON.stringify(templates))
      /*
      var sample_data = [
        {
          "email": "johndoe@example.com",
          "full_name": "John Doe",
          "company": "ABC Inc.",
          "website": "https://www.example.com",
          "notes": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, sapien vel bibendum lacinia, velit sapien aliquet nunc, in bibendum sapien nulla vel justo."
        },
        {
          "email": "janedoe@example.com",
          "full_name": "Jane Doe",
          "company": "XYZ Inc.",
          "website": "https://www.example.com",
          "notes": "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec quis nisl euismod, bibendum sapien vel, bibendum sapien."
        },
        {
          "email": "johndoe2@example.com",
          "full_name": "John Doe II",
          "company": "ABC Inc.",
          "website": "https://www.example.com",
          "notes": "Suspendisse potenti. Sed vel sapien vel odio bibendum bibendum. Nulla facilisi. Sed vel sapien vel odio bibendum bibendum. Nulla facilisi."
        },
        {
          "email": "janedoe2@example.com",
          "full_name": "Jane Doe II",
          "company": "XYZ Inc.",
          "website": "https://www.example.com",
          "notes": "Sed vel sapien vel odio bibendum bibendum. Nulla facilisi. Sed vel sapien vel odio bibendum bibendum. Nulla facilisi. Sed vel sapien vel odio bibendum bibendum. Nulla facilisi."
        },
        {
          "email": "johndoe3@example.com",
          "full_name": "John Doe III",
          "company": "ABC Inc.",
          "website": "https://www.example.com",
          "notes": "Sed vel sapien vel odio bibendum bibendum. Nulla facilisi. Sed vel sapien vel odio bibendum bibendum. Nulla facilisi. Sed vel sapien vel odio bibendum bibendum. Nulla facilisi."
        }
      ]
      sessionStorage.setItem("clientDocs", JSON.stringify(sample_data)) */
      this.setState({
        isLoadingScreenOn: false
      })
    } catch (error) {
      console.error(error);
    }
  }
  openComponent(component_name: string): void {
    var component: React.ReactNode;
    switch(component_name) {
      case 'data-viewer': component = <DataViewer goToControlPanel={this.openComponent}></DataViewer>; break;
      case 'template-builder': component = <TemplateBuilder goToControlPanel={this.openComponent}></TemplateBuilder>; break
      case 'email-sender': component = <EmailSender goToControlPanel={this.openComponent}></EmailSender>; break;
      default: component = <ControlPanel openComponent={this.openComponent}></ControlPanel>
    }
    this.setState({
      currentComponent: component
    })
  }
  render() {
    return (
      <div>
        {this.state.isLoadingScreenOn ? <Loading_Screen></Loading_Screen> : this.state.currentComponent}
        <Preloader></Preloader>
      </div>
    )
  }
}
