import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { withRouter } from 'react-router';

/**
 * Plain navigation bar.
 */
const PlainNavBar = (): JSX.Element => {
  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Container>
        <Navbar.Brand href="https://jeffreyca.github.io/spleeter-web/">Spleeter Web (Demo)</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link target="_blank" rel="noopener noreferrer" href="https://github.com/JeffreyCA/spleeter-web">
            GitHub
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default withRouter(PlainNavBar);
