import React, { Component } from 'react'
import './Loading_Screen.css'
import LoadingAnimation from './loading-animation.svg'
import pixelFlowLogo from './pixelFlow-logo.png'

export default class Loading_Screen extends Component {
  render() {
    return (
      <div className='loading-screen'>
        <img src={pixelFlowLogo}></img>
        <img src={LoadingAnimation}></img>
      </div>
    )
  }
}
