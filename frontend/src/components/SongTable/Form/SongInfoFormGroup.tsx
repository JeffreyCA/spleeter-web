import * as React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { SongData } from '../../../models/SongData';

interface Props {
  song: SongData;
}

const SongInfoFormGroup = (props: Props): JSX.Element => {
  const song = props.song;

  return (
    <>
      <Form.Group as={Row} controlId="formGridFirst" className="mb-2">
        <Form.Label column sm="2">
          Title:
        </Form.Label>
        <Col>
          <Form.Control name="title" disabled value={song.title} />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="formGridSecond" className="mb-2">
        <Form.Label column sm="2">
          Artist:
        </Form.Label>
        <Col>
          <Form.Control name="artist" disabled value={song.artist} />
        </Col>
      </Form.Group>
    </>
  );
};

export default SongInfoFormGroup;
