import React from 'react'
import './Preloader.css'
import Image from './preloader.svg'
export default function Preloader() {
  return (
    <div className='preloader'>
        <img src={Image} alt="" />
        <span>{'Sending email...'}</span>
    </div>
  )
}
