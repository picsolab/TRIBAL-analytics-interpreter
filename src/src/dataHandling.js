import * as d3 from 'd3';
import _ from 'lodash';

export const loadData = (callback = _.noop) => {
  Promise.all([
    d3.json('data/tweet_guncontrol.json', d => {
      console.log(d);
      return d;
    })
  ]).then(([tweets]) => {
    callback({
      tweets: tweets
    });
  });
};
