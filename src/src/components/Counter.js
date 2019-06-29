import React from 'react';
import styled from 'styled-components';
import { Button } from 'grommet';

const LocalButton = styled(Button)`
  background-color: black∑œ;
`;

const Counter = ({ onIncrease, onDecrease, number }) => {
  return (
    <div>
      <h1>{number}</h1>
      <div>
        <LocalButton
          // className={styles.searchButton}
          style={{ marginTop: '10px' }}
          size="xsmall"
          type="submit"
          primary
          label="Search"
        />
        <button onClick={onDecrease}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
