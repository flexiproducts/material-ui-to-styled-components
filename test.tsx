import styled from 'styled-components'
import React from 'react';
import { Popper, Typography, Paper } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
interface Props {
  open: boolean;
  parentEl?: HTMLElement | HTMLDivElement | null;
}

const HintPopper: React.FC<Props> = ({
  open,
  parentEl
}) => {
  // TODO: if we want to have more than 1 hint-popover we should have unique id's
  const id = open ? 'hint-popover' : undefined;
  return <Popper id={id} open={open} anchorEl={parentEl} placement="bottom" modifiers={{
    flip: {
      enabled: false
    },
    offset: {
      enabled: true,
      offset: '0,50'
    }
  }}>
      <Paper>
        <Typography>
          <Typography variant="h6">
            <FormattedMessage id="hint.welcome.title" />
            <span role="img" aria-label="Moving Cow">
              🐄{' '}
            </span>
          </Typography>
          <Typography variant="body1">
            <FormattedMessage id="hint.welcome.text" />
            <span role="img" aria-label="Pointing Up">
              ☝️
            </span>
          </Typography>
        </Typography>
      </Paper>
    </Popper>;
};

export default HintPopper;

const Typography = styled.div(({theme}) => css`
  padding: ${theme.spacing(2)};
`)

const Popper = styled(Popper)(({theme}) => css`
  z-index: ${theme.zIndex.drawer + 1};
`)

const Paper = styled(Paper)`
  background-colxor: #454545;
  color: #FFFFFF;
`;
