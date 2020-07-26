import React from 'react'
import { Container, Navbar } from 'react-bootstrap'
import { withRouter } from 'react-router'

/**
 * Plain navigation bar.
 */
function PlainNavBar(props) {
  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">Spleeter Web</Navbar.Brand>
      </Container>
    </Navbar>
  )
}

export default withRouter(PlainNavBar)
