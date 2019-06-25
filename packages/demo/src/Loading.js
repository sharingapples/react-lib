// @flow
import React from 'react';

type Props = {
  visible: boolean,
};

export default function Loading({ visible, ...other }: Props) {
  return (
    <div style={{ position: 'relative', height: 20 }}>
      <React.Fragment {...other} />
      { visible && (
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
          Loading
        </div>
      )}
    </div>
  );
}
