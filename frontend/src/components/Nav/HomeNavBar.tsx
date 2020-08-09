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
        <Navbar.Brand href="/">Spleeter Web</Navbar.Brand>
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
