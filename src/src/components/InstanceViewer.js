import React from 'react';
import * as d3 from 'd3';

import styled, { css } from 'styled-components';
import { Grommet, Button, Tabs, Tab, Box } from 'grommet';
import { grommet } from 'grommet/themes';
import { deepMerge } from 'grommet/utils';
import CustomizedInputBase from './SearchBar';
import index from '../index.css';
import { StylesContext } from '@material-ui/styles/StylesProvider';
import {
  SectionTitle,
  SubTitle,
  DocumentWrapper,
  GroupDiv,
  ContentDiv,
  ScoreDiv
} from '../GlobalStyles';

import RetrievalView from './RetrievalView';
import ListView from './ListView';

const InstanceViewerWrapper = styled.div.attrs({
  className: 'instance_viewer'
})`
  grid-area: i;
`;

const Header = styled.div.attrs({
  className: 'instance_viewer_header'
})`
  display: flex;
  margin-bottom: 10px;
`;

const InstanceId = styled.div.attrs({
  className: 'instance_id'
})`
  width: 60px;
  height: 15px;
  line-height: 1.5;
  margin: 3px;
  padding: 5px;
  border-radius: 5px;
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  background-color: darkgray;
`;

const tabCustomTheme = deepMerge(grommet, {
  global: {
    fontSize: '0.8rem',
    elevation: {
      light: {
        small: '0px 1px 5px rgba(0, 0, 0, 0.50)',
        medium: '0px 3px 8px rgba(0, 0, 0, 0.50)'
      }
    }
  },
  text: {
    medium: {
      size: '0.9rem'
    }
  },
  tab: {
    active: {
      background: 'dark-1',
      color: 'mediumpurple'
    },
    border: {
      size: '1px',
      color: 'gray'
    },
    color: 'gray',
    margin: 0,
    pad: {
      bottom: undefined,
      horizontal: 'xsmall'
    }
  },
  tabs: {
    gap: '0'
  }
});

const DocumentView = ({ tweet }) => {
  return (
    <DocumentWrapper>
      <GroupDiv>con</GroupDiv>
      <div>
        <ContentDiv>
          {
            "A singer killed at a meet &amp; greet, and then 50 people are murdered at a nightclub and yet some people still think we don't need gun control"
          }
        </ContentDiv>
        <div style={{ display: 'flex' }}>
          <ScoreDiv>{'V: ' + Math.round(0.42 * 100) / 100}</ScoreDiv>
          <ScoreDiv>{'A: ' + Math.round(0.87 * 100) / 100}</ScoreDiv>
          <ScoreDiv>{'D: ' + Math.round(0.56 * 100) / 100}</ScoreDiv>
        </div>
      </div>
    </DocumentWrapper>
  );
};

const DocumentListView = ({ tweets }) => {
  const top10Tweets = tweets.slice(0, 3);

  return top10Tweets.map(tweet => {
    return <DocumentView tweet={tweet} />;
  });
};

const InstanceViewer = ({ data }) => {
  return (
    <Grommet theme={tabCustomTheme} style={{ fontSize: '0.9rem' }}>
      <InstanceViewerWrapper>
        <Header>
          <SectionTitle>Explore</SectionTitle>
        </Header>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '45%' }}>
            <InstanceId>tweet 176</InstanceId>
            <div
              style={{
                height: '400px',
                borderRight: '1px solid gray',
                padding: '5px'
              }}
            >
              <DocumentView />
            </div>
          </div>
          <div style={{ fontSize: '10px' }}>
            <Tabs style={{ fontSize: '0.8rem' }}>
              <Tab title="Similar" style={{ fontSize: '0.8rem' }}>
                <Box pad="medium" style={{ fontSize: '0.8rem' }}>
                  <DocumentListView tweets={data} />
                </Box>
              </Tab>
              <Tab title="Contrastive">
                <Box pad="medium">
                  <DocumentListView tweets={data} />
                </Box>
              </Tab>
              <Tab title="Extreme">
                <Box pad="medium">
                  <DocumentListView tweets={data} />
                </Box>
              </Tab>
            </Tabs>
          </div>
        </div>
      </InstanceViewerWrapper>
    </Grommet>
  );
};

export default InstanceViewer;
