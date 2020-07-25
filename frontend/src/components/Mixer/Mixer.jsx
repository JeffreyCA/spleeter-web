import React, { Component } from 'react'
import { Alert, Container, Spinner, Row } from 'react-bootstrap'
import PlainNavBar from '../Nav/PlainNavBar'
import MixerPlayer from './MixerPlayer'
import axios from 'axios'

class Mixer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: undefined,
      isLoaded: false,
      hasError: false
    }
  }

  loadData = (mixId) => {
    axios
      .get(`/api/mix/dynamic/${mixId}/`)
      .then(({ data }) => {
        if (data) {
          this.setState({ isLoaded: true, data: data })
        }
        if (data.status === 'Queued' || data.status === 'In Progress') {
          this.timeout = setTimeout(() => this.loadData(mixId), 10000)
        }
      })
      .catch(() => {
        this.setState({
          isLoaded: true,
          hasError: true
        })
      })
  }

  componentDidMount() {
    const {
      match: { params }
    } = this.props
    const mixId = params.mixId
    this.loadData(mixId)
  }

  componentWillUnmount() {
    clearInterval(this.timeout)
  }

  render() {
    const { data, hasError, isLoaded } = this.state
    let alert = null

    if (!isLoaded) {
      return null
    }

    if (!data || hasError) {
      alert = <Alert variant="danger">An error occurred.</Alert>
    } else if (data.status === 'Queued' || data.status === 'In Progress') {
      alert = (
        <Alert className="mt-3" variant="warning">
          <Row className="align-items-center pl-2">
            <span>Processing mix...</span>
            <Spinner className="ml-2" animation="border" size="sm" />
          </Row>
        </Alert>
      )
    }

    const mixDone = data && data.status === 'Done'

    return (
      <div>
        <PlainNavBar />
        <Container>
          <h2 className="mt-3">Mixer</h2>
          {data ? <h3>{data.artist} - {data.title}</h3> : null}
          {alert}
          {mixDone && <MixerPlayer data={data} />}
        </Container>
      </div>
    )
  }
}

export default Mixer
