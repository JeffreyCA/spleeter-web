import React from 'react';
import { Button, Container, Navbar, Nav, DropdownButton, Dropdown } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { CloudUpload } from 'react-bootstrap-icons';

class MyNavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { onUploadClick } = this.props;

    return (
      <Navbar bg="light" variant="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">Spleeter Web</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="text-right">
            <Nav className="ml-auto">
              <Button onClick={onUploadClick} variant="success mr-3">Upload <CloudUpload /></Button>
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
