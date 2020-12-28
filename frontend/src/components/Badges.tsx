import * as React from 'react';
import { Badge } from 'react-bootstrap';

interface BadgeProps {
  className?: string;
  faded?: boolean;
}

export const OriginalBadge = (): JSX.Element => {
  return (
    <Badge className="ml-2 mr-2" pill variant="primary">
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
  const { faded } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'vocals-faded' : 'vocals'}>
      Vocals
    </Badge>
  );
};

export const AccompBadge = (props: BadgeProps): JSX.Element => {
  const { faded } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'accomp-faded' : 'accomp'}>
      Accompaniment
    </Badge>
  );
};

export const AccompShortBadge = (props: BadgeProps): JSX.Element => {
  const { faded } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'accomp-faded' : 'accomp'}>
      Accomp.
    </Badge>
  );
};

export const DrumsBadge = (props: BadgeProps): JSX.Element => {
  const { faded } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'drums-faded' : 'drums'}>
      Drums
    </Badge>
  );
};

export const BassBadge = (props: BadgeProps): JSX.Element => {
  const { faded } = props;
  return (
    <Badge pill className={props.className} variant={faded ? 'bass-faded' : 'bass'}>
      Bass
    </Badge>
  );
};
