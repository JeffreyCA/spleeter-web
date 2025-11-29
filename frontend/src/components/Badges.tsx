import * as React from 'react';
import { Badge } from 'react-bootstrap';

interface BadgeProps {
  className?: string;
  faded?: boolean;
  title?: string;
}

export const OriginalBadge = (props: BadgeProps): JSX.Element => {
  const { title } = props;
  return (
    <Badge className="ml-2 mr-2" pill variant="primary" title={title}>
      Original
    </Badge>
  );
};

export const AllBadge = (): JSX.Element => {
  return (
    <Badge pill variant="primary">
      All (Dynamic Mix)
    </Badge>
  );
};

export const VocalsBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'vocals-faded' : 'vocals'} title={title}>
      Vocals
    </Badge>
  );
};

export const AccompBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'accomp-faded' : 'accomp'} title={title}>
      Accompaniment
    </Badge>
  );
};

export const AccompShortBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'accomp-faded' : 'accomp'} title={title}>
      Accomp.
    </Badge>
  );
};

export const PianoBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'piano-faded' : 'piano'} title={title}>
      Piano
    </Badge>
  );
};

export const DrumsBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'drums-faded' : 'drums'} title={title}>
      Drums
    </Badge>
  );
};

export const BassBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'bass-faded' : 'bass'} title={title}>
      Bass
    </Badge>
  );
};

export const GuitarBadge = (props: BadgeProps): JSX.Element => {
  const { faded, title } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'guitar-faded' : 'guitar'} title={title}>
      Guitar
    </Badge>
  );
};
