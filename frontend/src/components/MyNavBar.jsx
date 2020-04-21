import React from 'react';
import axios from 'axios';
import { Button, Container, Navbar, Nav, NavDropdown, DropdownButton, Dropdown} from 'react-bootstrap';
import Link from 'react-router-dom';
import { withRouter } from 'react-router';
import { CloudUpload, Upload } from 'react-bootstrap-icons';

class MyNavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const styles = { 'paddingRight': '10px' } ;

    return (
      <Navbar bg="light" variant="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">Spleeter Web</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="flex-grow-1 text-right">
          <Nav className="ml-auto">
            <Button variant="success mr-3">Upload <CloudUpload /></Button>
            <DropdownButton title="Jeffrey" variant="outline-secondary">
              <Dropdown.Item>Profile</Dropdown.Item>
              <Dropdown.Item>Logout</Dropdown.Item>
            </DropdownButton>
          </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default withRouter(MyNavBar);
