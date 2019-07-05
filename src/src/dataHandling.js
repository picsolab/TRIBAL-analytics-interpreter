import * as d3 from 'd3';
import _ from 'lodash';

export const loadData = (callback = _.noop) => {
  console.log('with promise');
  console.log(d3.json('tweet_guncontrol.json'));
  console.log(__dirname);
  Promise.all([
    d3.json('data/tweet_guncontrol.json', d => {
      console.log(d);
      return d;
    })
  ]).then(([tweets]) => {
    console.log('inside');
    console.log(tweets);
    callback({
      tweets: tweets
    });
  });
};
