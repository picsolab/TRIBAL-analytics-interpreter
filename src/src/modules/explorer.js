import axios from 'axios';

// Action type

// Action generation functions
export const searchTweets = ({ searchKeyword }) => {
  return async dispatch => {
    await axios({
      method: 'post',
      url: '/tweets/searchTweets/',
      data: JSON.stringify({
        searchKeyword: searchKeyword
      })
    }).then(res => {
      const tweets = res.data.map(d => ({
        tweetId: d.tweet_id,
        tweetIdx: d.tweet_idx,
        group: d.grp,
        content: d.content,
        rawContent: d.raw_content,
        screenName: d.screen_name,
        valence: d.valence,
        valenceGrpPred: d.valence_grp_pred,
        valenceSeq: d.valence_seq,
        valenceSeqRank: d.valence_seq_rank,
        dominance: d.dominance,
        dominanceGrpPred: d.dominance_grp_pred,
        dominanceSeq: d.dominance_seq,
        dominanceSeqRank: d.dominance_seq_rank,
        care: d.care,
        careGrpPred: d.care_grp_pred,
        careSeq: d.care_seq,
        careSeqRank: d.care_seq_rank,
        fairness: d.fairness,
        fairnessGrpPred: d.fairness_grp_pred,
        fairnessSeq: d.fairness_seq,
        fairnessSeqRank: d.fairness_seq_rank,
        loyalty: d.loyalty,
        loyaltyGrpPred: d.loyalty_grp_pred,
        loyaltySeq: d.loyalty_seq,
        loyaltySeqRank: d.loyalty_seq_rank,
        authority: d.authority,
        authorityGrpPred: d.authority_grp_pred,
        authoritySeq: d.authority_seq,
        authoritySeqRank: d.authority_seq_rank,
        purity: d.purity,
        purityGrpPred: d.purity_grp_pred,
        puritySeq: d.purity_seq,
        puritySeqRank: d.purity_seq_rank
      }));

      dispatch({ type: 'SEARCH_TWEETS', payload: tweets });
    });
  };
};

// initial value for state
const initialState = {
  data: require('../data/tweet_guncontrol_combined_simple.json'),
  count: 0,
  searchKeyword: ''
};

// Reducers
const explorer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default explorer;
