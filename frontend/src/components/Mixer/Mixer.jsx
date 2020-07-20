import React, { Component } from 'react'
import { Container } from 'react-bootstrap'
import PlainNavBar from '../Nav/PlainNavBar'
import MixerPlayer from './MixerPlayer'

class Mixer extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <PlainNavBar />
        <Container>
          <h2 style={{marginTop: 20}}>Mixer</h2>
          <h3>Hello World - Artist Name</h3>
          <MixerPlayer />
        </Container>
      </div>
    )
  }
}

export default Mixer
