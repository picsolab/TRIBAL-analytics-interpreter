import pickle
import numpy as np
import pandas as pd
import string

class model_loader():
    def __init__(self, dim, mode, tweet_ids, post_w, ranking_w, length_w, freq_w, args):
        print(f'loading the "{dim}" model ouputs...')
        self.dim = dim
        if dim in ['v', 'd']:
            self.regression = True
        else:
            self.regression = False

        tweets = pickle.load(open(f'./app/static/models/dl_models/{dim}_model.pkl', 'rb'))
        df_tweets = pd.DataFrame(tweets).transpose()
        if mode == 'all':
            self.data = tweets
        elif mode == 'cluster':
            self.data = df_tweets.iloc[tweet_ids].to_dict('index')
        
        print('extracting sequences...')
        self._extract_seqs(args)
        print('calculating sequence importance...')

        self.post_w = post_w
        self.ranking_w = ranking_w
        self.length_w = length_w
        self.freq_w = freq_w

        self.sorted_importance = None
        self._cal_seq_importance(args)
        self.normalize_group_posterior()
        
    def get_tweet(self, tid):
        return self.data[tid]

    def show_important_examples(self, n=5):
        tids = self.get_most_important(n)
        # for tid in tids:
        #     print('tid ', tid, self.data[tid]['raw_text'])
        #     print(' '.join(self.data[tid]['seq']))
        #     print(f"Label 0: {self.data[tid]['label_0']} \t Prediction 0: {self.data[tid]['pred_0']}")
        #     print(f"Label 1: {self.data[tid]['label_1']} \t Prediction 1: {self.data[tid]['pred_1']}")
    
    def get_attention(self, tid):
        return self.data[tid]['attention'], self.data[tid]['text']
    
    def get_attentions_for_seqs(self):
        tids = self.data
        imp_seq_offset = self.extracted_seqs
        
        attns_for_seqs = []
        for tid in tids:
            attns_for_seqs.append(self.data[tid]['attention'][imp_seq_offset[tid][0]:imp_seq_offset[tid][1]])
        
        return dict(zip(tids, attns_for_seqs))
    
    def get_most_important(self, n=5):
        ### return tids of those that have the most important sequences
        if self.sorted_importance is None:
            self.sorted_importance = sorted(self.global_importance.items(), 
                                            key=lambda x: x[1], reverse=True)
        
        
        return self.data, [item[0] for item in self.sorted_importance[:n]]
    
    def normalize_group_posterior(self):
        tids = self.data
        if self.dim == 'h':
            grp_posts_np = np.array([ self.data[tid]['posterior_1'] for tid in self.data ])
        else:
            grp_posts_np = np.array([ self.data[tid]['post_1'] for tid in self.data ])
        grp_posts_norm = (grp_posts_np - grp_posts_np.min()) / (grp_posts_np.max() - grp_posts_np.min())
        
        return dict(zip(tids, grp_posts_norm))
    
    def normalize_construct_posterior(self):
        constr_posts_norm_dict = {}
        if self.regression == True:
            tids = self.data
            constr_posts_np = np.array([ self.data[tid]['post_0'] for tid in self.data ])
            constr_posts_norm = (constr_posts_np - constr_posts_np.min()) / (constr_posts_np.max() - constr_posts_np.min())
            constr_posts_norm_dict = dict(zip(tids, constr_posts_norm))
        else:
            for tid in self.data:
                if self.dim == 'h':
                    posts_per_tid = self.data[tid]['posterior_0']
                else:
                    posts_per_tid = self.data[tid]['post_0']
                #posts_per_tid_norm = (posts_per_tid - np.min(posts_per_tid)) / (np.max(posts_per_tid) - np.min(posts_per_tid))
                #constr_posts_norm_dict[tid] = str(np.argmax(posts_per_tid_norm)) + ',' + str(np.max(posts_per_tid_norm))
                constr_posts_norm_dict[tid] = int(np.argmax(posts_per_tid))
        
        return constr_posts_norm_dict
    
    def normalize_imp_score(self):
        tids = self.data
        imp_scores_np = np.array(list(self.global_importance.values()))
        imp_scores_norm = (imp_scores_np - imp_scores_np.min()) / (imp_scores_np.max() - imp_scores_np.min())
        
        return dict(zip(tids, imp_scores_norm))
    
    #private methods
    def _cal_seq_importance(self, args):
        self._calculate_global_rankings(args)
        
        #calculate bounds of posteriors
        post_0_min = 0
        post_0_max = 0
        post_1_min = 0
        post_1_max = 0
        
        for tid in self.data:
            if self.dim == 'h':
                _post_0 = self.data[tid]['posterior_0']
                _post_1 = self.data[tid]['posterior_1']
            else:
                _post_0 = self.data[tid]['post_0']
                _post_1 = self.data[tid]['post_1']
            _label_0 = self.data[tid]['label_0']
            if not isinstance(_post_0, float):
                _post_0 = _post_0[_label_0]
            
            if _post_0 > post_0_max:
                post_0_max = _post_0
            elif _post_0 < post_0_min:
                post_0_min = _post_0
            
            if _post_1 > post_1_max:
                post_1_max = _post_1
            elif _post_1 < post_1_min:
                post_1_min = _post_1
                
        
        
        ran_0 = post_0_max - post_0_min
        ran_1 = post_1_max - post_1_min
        
        self.global_importance = {}
        for tid in self.data:
            if self.dim == 'h':
                _post_0 = self.data[tid]['posterior_0']
                _post_1 = self.data[tid]['posterior_1']
            else:
                _post_0 = self.data[tid]['post_0']
                _post_1 = self.data[tid]['post_1']
                
            _label_0 = self.data[tid]['label_0']
            if not isinstance(_post_0, float):
                _post_0 = _post_0[_label_0]
            
            #regularized post
            if self.regression:
                post_0 = np.abs((_post_0 - post_0_min)/ran_0 - 0.5) * 2
            else:
                post_0 = (_post_0 - post_0_min)/ran_0
                
            post_1 = (_post_1 - post_1_min)/ran_1
            #regularized ranking
            ranking = self.data[tid]['seq_ranking'] / len(self.data)
            
            #length
            length = len(self.data[tid]['seq'])
            
            #frequency
            freq = self.seq_freq[' '.join(self.data[tid]['seq'])]
            
            importance = (post_0*self.post_w + np.log(1 + length*self.length_w)) / (ranking*self.ranking_w + np.log(1 + freq*self.freq_w))
            self.data[tid]['seq_importance'] = importance
            self.global_importance[tid] = importance
            
        return
    
    def _calculate_global_rankings(self, args):
        self.global_seq_scores = {}
        for tid in self.data:
            loc = self.extracted_seqs[tid]
            attentions = self.data[tid]['attention']
            text = self.data[tid]['text']
            scores = np.array([attentions[i] for i in range(loc[0], loc[1])])
            length = len(text)
            s = np.mean(scores) * length
            self.global_seq_scores[tid] = s
        sorted_scores = sorted(self.global_seq_scores.items(), key=lambda x:x[1], reverse=True)
        for i, item in enumerate(sorted_scores):
            self.data[item[0]]['seq_ranking'] = i + 1
            
    def _extract_seqs(self, args):
        self.seq_freq = {}
        self.extracted_seqs = {}
        for tid in self.data:
            _case = self.data[tid]
            _, locs, seqs = self._get_seq(_case)
            loc, seq = self._select_seq(locs, seqs)
            self.extracted_seqs[tid] = loc
            self.data[tid]['seq'] = seq
            
            text_seq = ' '.join(seq)
            if text_seq not in self.seq_freq:
                self.seq_freq[text_seq] = 1
            else:
                self.seq_freq[text_seq] += 1
                
        return    
    
    def _select_seq(self, locs, seqs):
        return locs[-1], seqs[-1]
    
    
    def _get_seq(self, case):
        attn = case['attention']
        attn = [item for item in attn if item > 0]
        max_s = 0
        max_loc = []
        lengths = []
        std = np.std(attn)

        for _window in range(1, 10):
            for i in range(len(attn) - _window):
                _seq = attn[i:i + _window]
                punc = [char for char in string.punctuation] + ['<hashtag>']

                if any(x in punc for x in case['text'][i: i+_window]):
                    continue

                _aver_s = np.mean(_seq)
                if _aver_s > max_s:
                    max_s = _aver_s
                    max_loc = [(i, i + _window)]
                    lengths = [_window]

                elif _aver_s > max_s - 1 * std:
                    max_loc.append((i, i + _window))
                    lengths.append(_window)
                    
        sub_seqs = [case['text'][loc[0]:loc[1]] for loc in max_loc]

        max_length = np.max(lengths)
        out_max_loc = []
        out_sub_seqs = []
        for i in range(len(max_loc)):
            if max_loc[i][1] - max_loc[i][0] >= max_length - 1:
                out_max_loc.append(max_loc[i])
                out_sub_seqs.append(sub_seqs[i])

        return max_s, out_max_loc, out_sub_seqs
    
    def export_static_result(self):
        return

    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, tid):
        return self.data[tid]