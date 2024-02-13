import React, { Component } from 'react'
import './ControlPanel.css'

interface ControlPanelProps {
  openComponent: (component_name: string) => void
}
interface ControlPanelState {

}

export default class ControlPanel extends Component<ControlPanelProps, ControlPanelState> {
  constructor(props: ControlPanelProps) {
    super(props)
  }
  render() {
    return (
      <div className='control-panel'>
        <button onClick={() =>{this.props.openComponent('data-viewer')}}>data viewer</button>
        <button onClick={() =>{this.props.openComponent('template-builder')}}>template builder</button>
        <button onClick={() =>{this.props.openComponent('email-sender')}}>email sender</button>
      </div>
    )
  }
}
