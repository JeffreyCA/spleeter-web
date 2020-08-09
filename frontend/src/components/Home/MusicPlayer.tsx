import ReactJkMusicPlayer, {
  ReactJkMusicPlayerAudioInfo,
  ReactJkMusicPlayerAudioListProps,
  ReactJkMusicPlayerCustomLocale,
} from '@jeffreyca/react-jinke-music-player';
import * as React from 'react';
import { SongData } from '../../models/SongData';
import { StaticMix } from '../../models/StaticMix';
import { AccompShortBadge, BassBadge, DrumsBadge, OriginalBadge, VocalsBadge } from '../Badges';
import './MusicPlayer.css';

interface Props {
  songData?: SongData;
  staticMix?: StaticMix;
  getAudioInstance: (instance: HTMLAudioElement) => void;
  onAudioPause: (audioInfo: ReactJkMusicPlayerAudioInfo) => void;
  onAudioPlay: (audioInfo: ReactJkMusicPlayerAudioInfo) => void;
}

/**
 * Music player component that controls audio playback. It shows up as a horizontal bar at the
 * bottom of the screen.
 */
class MusicPlayer extends React.Component<Props> {
  render(): JSX.Element | null {
    const { getAudioInstance, songData, staticMix, onAudioPause, onAudioPlay } = this.props;
    if (!songData && !staticMix) {
      return null;
    }

    // Show a colour-coded badge indicating the components that are included
    let audioTitleExtra;
    let audioList: ReactJkMusicPlayerAudioListProps[] = [];
    if (songData) {
      audioTitleExtra = <OriginalBadge />;
      audioList = [
        {
          name: songData.title,
          singer: songData.artist,
          musicSrc: songData.url,
        },
      ];
    } else if (staticMix) {
      const vocalBadge = staticMix.vocals ? <VocalsBadge /> : null;
      const accompBadge = staticMix.other ? <AccompShortBadge /> : null;
      const bassBadge = staticMix.bass ? <BassBadge /> : null;
      const drumsBadge = staticMix.drums ? <DrumsBadge /> : null;
      audioTitleExtra = (
        <div className="badge-flex ml-2 mr-2">
          {vocalBadge} {accompBadge} {bassBadge} {drumsBadge}
        </div>
      );
      audioList = [
        {
          name: staticMix.title,
          singer: staticMix.artist,
          musicSrc: staticMix.url,
        },
      ];
    }

    return (
      <ReactJkMusicPlayer
        audioLists={audioList}
        getAudioInstance={getAudioInstance}
        audioTitleExtra={audioTitleExtra}
        responsive={false}
        theme="light"
        mode="full" // Show player at bottom of page
        clearPriorAudioLists={true} // Never keep old audio list
        autoPlayInitLoadPlayList={true} // Autoplay after updating audio list
        toggleMode={false} // Disable minimizing audio player bar
        remove={false} // Disable removing tracks from playlist
        drag={false}
        preload={true}
        autoHiddenCover={true}
        showDownload={false}
        showPlayMode={false}
        showReload={false}
        showThemeSwitch={false}
        showLyric={false}
        onAudioPause={onAudioPause}
        onAudioPlay={onAudioPlay}
        locale={{ playListsText: 'Now Playing' } as ReactJkMusicPlayerCustomLocale}
      />
    );
  }
}

export default MusicPlayer;
