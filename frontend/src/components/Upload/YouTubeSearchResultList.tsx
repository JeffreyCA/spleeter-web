import he from 'he';
import React from 'react';
import { Alert, Button, Col, Image, ListGroup, Row } from 'react-bootstrap';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import { YouTubeSearchResponse } from '../../models/YouTubeSearchResponse';
import { YouTubeVideo } from '../../models/YouTubeVideo';
import { getYouTubeLinkForId, toDurationTimestamp } from '../../Utils';

interface Props {
  searchResponse?: YouTubeSearchResponse;
  onSearchResultClick: (video: YouTubeVideo) => void;
}

const onExtLinkClick = (event: React.SyntheticEvent<HTMLElement>) => {
  event.stopPropagation();
};

export const YouTubeSearchResultList = (props: Props): JSX.Element | null => {
  if (!props.searchResponse) {
    return null;
  }

  return (
    <ListGroup style={{ maxHeight: '40vh', overflowY: 'scroll' }}>
      {props.searchResponse.results.length === 0 && <Alert variant="warning">No videos found.</Alert>}
      {props.searchResponse.results.map((video, index) => (
        <ListGroup.Item key={index} action onClick={() => props.onSearchResultClick(video)}>
          <Row>
            <Col xs={2} className="p-0">
              <Image src={video.thumbnail} thumbnail />
            </Col>
            <Col className="yt-search-result">
              <span className="yt-search-title">{he.decode(video.title)}</span>
              <br />
              <span className="yt-search-channel">{he.decode(video.channel)}</span>
              <br />
              <span className="yt-search-duration">{toDurationTimestamp(video.duration)}</span>
            </Col>
            <Col xs={1} className="yt-search-extlink p-0">
              <Button size="sm" href={getYouTubeLinkForId(video.id)} target="_blank" onClick={onExtLinkClick}>
                <BoxArrowUpRight size={12} />
              </Button>
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};
