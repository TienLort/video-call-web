import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface ILoadingProps {
  marginTop?: number;
  textAlign?: 'center' | 'left' | 'right';
  size?: number;
}

const Loading = (props: ILoadingProps) => {
  const { marginTop = 2, size = 100, textAlign = 'center' } = props;
  return (
    <Box textAlign={textAlign} marginTop={marginTop}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default Loading;
