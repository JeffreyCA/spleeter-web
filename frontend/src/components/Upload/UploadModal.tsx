import { Dropzone, IFileWithMeta, StatusValue } from '@jeffreyca/react-dropzone-uploader';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import axios from 'axios';
import he from 'he';
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { ALLOWED_EXTENSIONS } from '../../Constants';
import { SongData } from '../../models/SongData';
import { YouTubeLinkFetchStatus } from '../../models/YouTubeLinkFetchStatus';
import { YouTubeSearchResponse } from '../../models/YouTubeSearchResponse';
import { YouTubeVideo } from '../../models/YouTubeVideo';
import { getYouTubeLinkForId } from '../../Utils';
import CustomInput from './CustomInput';
import CustomPreview from './CustomPreview';
import './UploadModal.css';
import UploadModalForm from './UploadModalForm';
import { YouTubeForm } from './YouTubeForm';

const DEBOUNCE_MS = 400;

const ERROR_MAP = new Map([
  ['aborted', 'Operation aborted.'],
  ['rejected_file_type', 'File type not supported.'],
  ['rejected_max_files', 'Only one file is allowed.'],
  ['error_file_size', 'File exceeds size limit (30 MB).'],
  ['error_upload_params', 'Unknown error occurred.'],
]);

function isValidYouTubeLink(link: string): boolean {
  const re = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9_-]+)/;
  return re.test(link);
}

interface Props {
  show: boolean;
  hide: () => void;
  refresh: () => void;
}

interface State {
  droppedFile: boolean;
  fetchStatus: YouTubeLinkFetchStatus;
  isUploading: boolean;
  detailsStep: boolean;
  isSubmitting: boolean;
  fileId: number;
  artist: string;
  title: string;
  link?: string;
  query?: string;
  searchResponse?: YouTubeSearchResponse;
  errors: string[];
}

class UploadModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      droppedFile: false,
      fetchStatus: YouTubeLinkFetchStatus.IDLE,
      isUploading: false,
      isSubmitting: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: '',
      errors: [],
    };
  }

  /**
   * Reset all non-error state fields
   */
  resetState = (): void => {
    this.setState({
      droppedFile: false,
      fetchStatus: YouTubeLinkFetchStatus.IDLE,
      isUploading: false,
      isSubmitting: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: '',
      link: undefined,
      query: undefined,
      searchResponse: undefined,
    });
  };

  /**
   * Reset errors
   */
  resetErrors = (): void => {
    this.setState({
      errors: [],
    });
  };

  resetFetchState = (): void => {
    this.setState({
      fetchStatus: YouTubeLinkFetchStatus.IDLE,
    });
  };

  /**
   * Make API request to delete SourceFile from DB and filesystem
   */
  deleteCurrentFile = (): void => {
    /*
    if (this.state.fileId !== -1) {
      axios.delete('/api/source-file/file/', { data: { id: this.state.fileId } });
    }
    */
  };

  /**
   * Called when modal hidden without finishing
   */
  onHide = (): void => {
    this.deleteCurrentFile();
    this.props.hide();
  };

  /**
   * Called when modal finishes exit animation
   */
  onExited = (): void => {
    // Reset here so modal contents do not flicker during animation
    this.resetState();
    this.resetErrors();
  };

  /**
   * Called when back button is clicked.
   */
  onBack = (): void => {
    /*
    if (this.state.detailsStep) {
      this.setState({
        detailsStep: false,
      });
    }
    */
  };

  /**
   * Called when primary button is clicked.
   */
  onNext = (): void => {
    /*
    if (!this.state.detailsStep) {
      this.setState({
        detailsStep: true,
      });
    } else if (this.state.droppedFile) {
      const song = {
        source_file: this.state.fileId,
        artist: this.state.artist,
        title: this.state.title,
      };
      // Make request to add Song
      this.setState({
        isSubmitting: true,
      });
      axios
        .post<SongData>('/api/source-track/file/', song)
        .then(({ data }) => {
          this.props.hide();
          this.props.refresh();
          this.setState({
            isSubmitting: false,
          });
        })
        .catch(err => {
          this.setState({
            isSubmitting: false,
            errors: [err],
          });
        });
    } else if (this.state.link) {
      const details = {
        youtube_link: this.state.link,
        artist: this.state.artist,
        title: this.state.title,
      };
      this.setState({
        isSubmitting: true,
      });
      // Submit YouTube song
      axios
        .post('/api/source-track/youtube/', details)
        .then(() => {
          this.props.hide();
          this.props.refresh();
          this.setState({
            isSubmitting: false,
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          this.setState({
            isSubmitting: false,
            errors: data.errors,
          });
        });
    }
    */
  };

  /**
   * Query backend YouTube search API for video search results.
   * @param query Query string
   */
  youtubeSearch = (query: string): void => {
    /*
    this.setState({
      fetchStatus: YouTubeLinkFetchStatus.IS_FETCHING,
    });

    axios
      .get<YouTubeSearchResponse>('/api/search/', {
        params: {
          query,
        },
      })
      .then(({ data }) => {
        this.setState({
          searchResponse: data,
          fetchStatus: YouTubeLinkFetchStatus.DONE,
        });
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          errors: data.errors,
          fetchStatus: YouTubeLinkFetchStatus.ERROR,
        });
      });
    */
  };

  /**
   * Debounced version of youtubeSearch.
   */
  youtubeSearchDebounced = AwesomeDebouncePromise(this.youtubeSearch, DEBOUNCE_MS);

  /**
   * Called when artist or title fields change.
   */
  onDetailFieldChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    /*
    event.preventDefault();
    const { name, value } = event.target;

    if (name === 'artist' || name === 'title') {
      this.resetErrors();
      this.setState({ [name]: value } as any);
    }
    */
  };

  /**
   * Called when value of YouTube search text field changes.
   */
  onYouTubeFieldChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    /*
    event.preventDefault();
    const { name, value } = event.target;

    if (name !== 'link') {
      return;
    }
    this.resetErrors();

    if (!value) {
      // Clear state if input field was cleared
      this.resetFetchState();
      this.setState({
        link: undefined,
        query: undefined,
        searchResponse: undefined,
      });
    } else if (!isValidYouTubeLink(value)) {
      // User entered a search query
      this.setState({
        query: value,
      });
      this.youtubeSearchDebounced(value);
    } else {
      // User entered a valid YouTube link
      this.setState({
        fetchStatus: YouTubeLinkFetchStatus.IS_FETCHING,
        link: value,
      });

      axios
        .get('/api/source-file/youtube/', {
          params: {
            link: value,
          },
        })
        .then(({ data }) => {
          const { artist, title } = data;
          this.setState({
            fetchStatus: YouTubeLinkFetchStatus.DONE,
            artist: artist,
            title: title,
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.status === 'duplicate') {
            this.setState({
              fetchStatus: YouTubeLinkFetchStatus.ERROR,
            });
          } else {
            this.setState({
              errors: response.data.errors,
              fetchStatus: YouTubeLinkFetchStatus.ERROR,
            });
          }
        });
    }
    */
  };

  /**
   * Called when file upload status changes.
   */
  onFileUploadStatusChange = ({ meta, remove, xhr }: IFileWithMeta, status: StatusValue): void => {
    /*
    const aborted =
      status === 'aborted' ||
      status === 'rejected_file_type' ||
      status === 'rejected_max_files' ||
      status === 'error_file_size' ||
      status === 'error_validation' ||
      status === 'error_upload_params';

    if (aborted) {
      // Upload aborted, so reset state and show error message
      const getResult = ERROR_MAP.get(status);
      const errorMsg = getResult ? [getResult] : ([] as string[]);
      this.resetState();
      this.setState({ errors: errorMsg });
    } else if (status === 'error_upload') {
      // Error with upload, so show error message
      try {
        const responseObject = JSON.parse(xhr?.response);
        if (responseObject && responseObject['errors']) {
          this.setState({ errors: responseObject['errors'] });
        }
      } catch {
        this.setState({ errors: ['Unknown error.'] });
      }
    } else if (status === 'removed') {
      // File was removed
      this.deleteCurrentFile();
      this.resetState();
      this.resetErrors();
    } else if (status === 'preparing') {
      // File upload initiated
      this.resetErrors();
      this.setState({
        droppedFile: true,
        isUploading: true,
        link: undefined,
      });
    } else if (status === 'done') {
      // File upload completed successfully, get returned ID and metadata info
      const responseObject = JSON.parse(xhr?.response);
      if (responseObject['file_id']) {
        this.setState({
          isUploading: false,
          fileId: responseObject['file_id'],
          artist: responseObject['artist'],
          title: responseObject['title'],
        });
      }
    }
    */
  };

  /**
   * Called when search result is clicked.
   * @param video Video that was clicked
   */
  onSearchResultClick = (video: YouTubeVideo): void => {
    /*
    this.setState({
      artist: he.decode(video.parsed_artist),
      title: he.decode(video.parsed_title),
      link: getYouTubeLinkForId(video.id),
      detailsStep: true,
    });
    */
  };

  render(): JSX.Element {
    const {
      droppedFile,
      fetchStatus,
      isUploading,
      isSubmitting,
      detailsStep,
      artist,
      title,
      link,
      query,
      searchResponse,
      errors,
    } = this.state;
    const { show } = this.props;
    const modalTitle = detailsStep ? 'Fill in the details' : 'Upload song or provide YouTube video';
    const primaryText = detailsStep ? 'Finish' : 'Next';

    let buttonEnabled;
    if (!detailsStep) {
      if (droppedFile) {
        buttonEnabled = !isUploading;
      } else {
        buttonEnabled = errors.length === 0 && link && fetchStatus === YouTubeLinkFetchStatus.DONE;
      }
    } else {
      buttonEnabled = artist && title && !isSubmitting;
    }

    return (
      <Modal show={show} onHide={!isSubmitting ? this.onHide : undefined} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <div>Functionality disabled for demo purposes.</div>
          </Alert>
          {detailsStep ? (
            <UploadModalForm artist={artist} title={title} handleChange={this.onDetailFieldChange} />
          ) : (
            <div>
              <Dropzone
                disabled
                maxFiles={1}
                multiple={false}
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChangeStatus={this.onFileUploadStatusChange}
                // getUploadParams={() => ({ url: '/api/source-file/file/' })}
                InputComponent={CustomInput}
                PreviewComponent={CustomPreview}
              />
              <hr className="hr-text" data-content="OR" />
              <YouTubeForm
                fetchStatus={fetchStatus}
                disabled
                value={query || link}
                searchResponse={searchResponse}
                handleChange={this.onYouTubeFieldChange}
                onSearchResultClick={this.onSearchResultClick}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" disabled={isSubmitting} onClick={this.onHide}>
            Cancel
          </Button>
          {detailsStep && (
            <Button variant="outline-secondary" disabled={isSubmitting} onClick={this.onBack}>
              Back
            </Button>
          )}
          <Button variant={detailsStep ? 'success' : 'primary'} disabled={!buttonEnabled} onClick={this.onNext}>
            {primaryText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default UploadModal;
