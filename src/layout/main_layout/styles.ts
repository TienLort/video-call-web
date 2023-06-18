import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFFamily: 'GT Walsheim Pro',
    backgroundColor: '#1c1c1c',
    overflowX: 'hidden',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    flex: 1,
    background: theme.palette.secondary.light,
    display: 'flex',
  },
  page: {
    flex: 1,
    display: 'flex',
    minHeight: '600px',
    background: '#fafafa',
  },
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'rgba(33, 35, 38, 0.1) 0px 10px 10px -10px',
  },
}));
