import React, { Component } from 'react'
import './Button.css'

interface ButtonProps {
  type: 'button' | 'submit' | 'reset',
  text: string,
  iconPath?: string,
  className?: string,
  onClick?: (() => void) | (() => Promise<void>)
}

export default class Button extends Component<ButtonProps> {
  render() {
    return (
        <button 
          type={this.props.type} 
          onClick={this.props.onClick ? this.props.onClick : () => {}}
          className={`button-component ${!!this.props.className ? this.props.className : ''}`}
        >
            {!!this.props.iconPath ? <img src={this.props.iconPath}></img> : <></>}
            <span>{this.props.text}</span>
        </button>
    )
  }
}
