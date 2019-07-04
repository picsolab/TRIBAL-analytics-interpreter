import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginTop: 10
  },
  input: {
    marginLeft: 8,
    flex: 1,
    fontSize: '0.9rem'
  },
  iconButton: {
    padding: 2
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4
  }
});

const SearchBar = () => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Search"
        inputProps={{ 'aria-label': 'Search' }}
      />
      <IconButton className={classes.iconButton} aria-label="Search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
