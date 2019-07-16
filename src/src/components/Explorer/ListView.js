import React from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';
import { Button } from 'grommet';
import {
  ComponentSubTitle,
  SubTitle,
  SubTitle2,
  ListViewStyle
} from '../../GlobalStyles';

import User from '../subcomponents/User';

const ListViewWrapper = styled.div.attrs({
  className: 'list_view_wrapper'
})`
  grid-area: l;
  display: flex;
`;

const UserListWrapper = styled(ListViewStyle).attrs({
  className: 'user_list'
})`
  grid-area: u;
`;

const WordListWrapper = styled(ListViewStyle).attrs({
  className: 'word_list'
})`
  grid-area: w;
`;

// const UserView = ({ user }) => {
//   return (
//     <div>
//       <div style={{ display: 'flex' }}>
//         <div>{user.screenName}</div>
//         <div>{user.content}</div>
//       </div>
//       <div style={{ display: 'flex' }}>
//         <div>{'V: ' + Math.round(0.24 * 100) / 100}</div>
//         <div>{'A: ' + Math.round(0.38 * 100) / 100}</div>
//         <div>{'D: ' + Math.round(0.23 * 100) / 100}</div>
//       </div>
//     </div>
//   );
// };

const UserListView = ({ users }) => {
  const top10Users = users.slice(0, 3);
  const userData = top10Users.map(tweet => {
    return {
      userId: tweet.user_id,
      screenName: tweet.screen_name,
      numFollower: tweet.num_followers,
      numFriends: tweet.num_friends,
      numRetweeted: tweet.num_retweeted
    };
  });

  return userData.map(user => <User user={user} />);
};

const ListView = ({ data }) => {
  const mockup = [0.7, 0.5, 0.3, 0.4];
  console.log('data in ListView: ', data);

  const users = data;

  return (
    <ListViewWrapper>
      <div>
        <ComponentSubTitle>User</ComponentSubTitle>
        <UserListWrapper>
          <UserListView users={users} />
        </UserListWrapper>
      </div>
      <div>
        <ComponentSubTitle>Word</ComponentSubTitle>
        <WordListWrapper />
      </div>
    </ListViewWrapper>
  );
};

export default ListView;
