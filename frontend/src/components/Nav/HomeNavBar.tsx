import * as React from 'react';
import { Button, Container, Navbar, Nav } from 'react-bootstrap';
import { CloudUpload } from 'react-bootstrap-icons';
import { withRouter, RouteComponentProps } from 'react-router';

interface Props extends RouteComponentProps {
  onUploadClick: () => void;
}

/**
 * Navigation bar with upload button.
 */
const HomeNavBar = (props: Props): JSX.Element => {
  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Container>
        <Navbar.Brand href="https://jeffreyca.github.io/spleeter-web/">Spleeter Web (Demo)</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link target="_blank" rel="noopener noreferrer" href="https://github.com/JeffreyCA/spleeter-web">
            GitHub
          </Nav.Link>
        </Nav>
        <Navbar.Toggle />
        <Navbar.Collapse className="text-right">
          <Nav className="ml-auto">
            <Button onClick={props.onUploadClick} variant="success mr-3">
              Upload <CloudUpload />
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default withRouter(HomeNavBar);
