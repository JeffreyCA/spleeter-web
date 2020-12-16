import * as React from 'react';
import { Col, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Check, X } from 'react-bootstrap-icons';
import { YouTubeLinkFetchStatus } from '../../models/YouTubeLinkFetchStatus';
import { YouTubeSearchResponse } from '../../models/YouTubeSearchResponse';
import { YouTubeVideo } from '../../models/YouTubeVideo';
import './YouTubeForm.css';
import { YouTubeSearchResultList } from './YouTubeSearchResultList';

interface Props {
  value?: string;
  searchResponse?: YouTubeSearchResponse;
  disabled: boolean;
  fetchStatus: YouTubeLinkFetchStatus;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchResultClick: (video: YouTubeVideo) => void;
}

export const YouTubeForm = (props: Props): JSX.Element | null => {
  const { value, searchResponse: searchResults, disabled, fetchStatus, handleChange, onSearchResultClick } = props;
  let trailingIcon = null;
  if (fetchStatus === YouTubeLinkFetchStatus.IS_FETCHING) {
    trailingIcon = <Spinner className="ml-2" animation="border" size="sm" role="status" aria-hidden="true" />;
  } else if (fetchStatus === YouTubeLinkFetchStatus.DONE) {
    trailingIcon = <Check className="ml-2" />;
  } else if (fetchStatus === YouTubeLinkFetchStatus.ERROR) {
    trailingIcon = <X className="ml-2" />;
  }

  return (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId="formGridFirst">
          <Form.Label>YouTube link or search query</Form.Label>
          <InputGroup>
            <Form.Control
              name="link"
              disabled={disabled}
              defaultValue={value}
              placeholder="https://www.youtube.com/watch?v= or query"
              onChange={handleChange}
            />
            <InputGroup.Append className="justify-content-center align-items-center">{trailingIcon}</InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Form.Row>
      <YouTubeSearchResultList searchResponse={searchResults} onSearchResultClick={onSearchResultClick} />
    </>
  );
};
