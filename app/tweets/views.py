from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
from django.contrib.postgres.search import SearchQuery, SearchVector
from django.db.models import Q

from rest_framework import status
from . import models

import pandas as pd
import numpy as np
import json, math, pickle, collections
from sklearn.tree import DecisionTreeClassifier, export_graphviz
from sklearn.cluster import AgglomerativeClustering
from sklearn.model_selection import train_test_split, cross_val_score, cross_validate
from sklearn import preprocessing
from sklearn.inspection import partial_dependence, plot_partial_dependence
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.metrics import accuracy_score
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import normalize

from collections import Counter
from io import StringIO
import time

from static.models import dl

# A tweet as json
'''
{'grp': '0', 'content': 'truck control...', 'screen_name': 'feedthebuzz', 
 'valence': 0.333333333, 'valence_seq': 'terror attack kills scores in nice', 
 'valence_seq_rank': 15, 'valence_pred': 0.161331654, 'valence_grp_pred': 0, 
 'dominance': 0.270833333, 'dominance_seq': 'terror attack kills scores in', 'dominance_seq_rank': 15, 'dominance_pred': 0.299620539, 'dominance_grp_pred': 0, 
 'care': 2, 'care_seq': 'terror attack kills scores in nice', 'care_seq_rank': 13, 'care_pred': 2, 'care_grp_pred': 0, 'care_prob': 4.848002434, 
 'fairness': 1, 'fairness_seq': 'terror attack kills', 'fairness_seq_rank': 3, 'fairness_pred': 2, 'fairness_grp_pred': 0, 'fairness_prob': 1.320369363, 
 'tweet_id': 0
}
'''


def save_model(model, model_id):
    file_name = './app/static/models/' + model_id
    file_name = file_name + '.pkl'
    with open(file_name, 'wb') as f:
        pickle.dump(model, f)
        f.close()


def load_model(model_id):
    file_name = './app/static/models/' + model_id + '.pkl'
    model = ''

    with open(file_name, 'rb') as f:
        unpickler = pickle.Unpickler(f)
        model = unpickler.load()
        f.close()

    return model

def get_rules(dtc, df):
    rules_list = []
    values_path = []
    values = dtc.tree_.value

    def RevTraverseTree(tree, node, rules, pathValues):
        '''
        Traverase an skl decision tree from a node (presumably a leaf node)
        up to the top, building the decision rules. The rules should be
        input as an empty list, which will be modified in place. The result
        is a nested list of tuples: (feature, direction (left=-1), threshold).  
        The "tree" is a nested list of simplified tree attributes:
        [split feature, split threshold, left node, right node]
        '''
        # now find the node as either a left or right child of something
        # first try to find it as a left node            

        try:
            prevnode = tree[2].index(node)           
            leftright = '<='
            pathValues.append(values[prevnode])
        except ValueError:
            # failed, so find it as a right node - if this also causes an exception, something's really f'd up
            prevnode = tree[3].index(node)
            leftright = '>'
            pathValues.append(values[prevnode])

        # now let's get the rule that caused prevnode to -> node
        p1 = df.columns[tree[0][prevnode]]    
        p2 = tree[1][prevnode]    
        rules.append(str(p1) + ' ' + leftright + ' ' + str(p2))

        # if we've not yet reached the top, go up the tree one more step
        if prevnode != 0:
            RevTraverseTree(tree, prevnode, rules, pathValues)

    # get the nodes which are leaves
    leaves = dtc.tree_.children_left == -1
    leaves = np.arange(0,dtc.tree_.node_count)[leaves]

    # build a simpler tree as a nested list: [split feature, split threshold, left node, right node]
    thistree = [dtc.tree_.feature.tolist()]
    thistree.append(dtc.tree_.threshold.tolist())
    thistree.append(dtc.tree_.children_left.tolist())
    thistree.append(dtc.tree_.children_right.tolist())

    # get the decision rules for each leaf node & apply them
    for (ind,nod) in enumerate(leaves):

        # get the decision rules
        rules = []
        pathValues = []
        RevTraverseTree(thistree, nod, rules, pathValues)

        pathValues.insert(0, values[nod])      
        pathValues = list(reversed(pathValues))

        rules = list(reversed(rules))

        rules_list.append(rules)
        values_path.append(pathValues)

    return (rules_list, values_path, leaves)

# For the initial run
class LoadData(APIView):
    def get(self, request, format=None):
        tweet_objects = models.Tweet.objects.all()
        # serializer return string, so convert it to list with eval()
        tweet_objects_json = eval(serializers.serialize('json', tweet_objects))

        tweets_json = []
        for tweet in tweet_objects_json:
            tweet_json = tweet['fields']
            tweet_json.update({ 'tweet_id': str(tweet['pk']) })
            tweets_json.append(tweet_json)

        return Response(tweets_json)


class LoadUsers(APIView):
    def get(self, request, format=None):
        users_objects = models.User.objects.all()
        # serializer return string, so convert it to list with eval()
        users_objects_json = eval(serializers.serialize('json', users_objects))

        users_json = []
        for user in users_objects_json:
            user_json = user['fields']
            user_json.update({ 'screen_name': user['pk'] })
            users_json.append(user_json)

        return Response(users_json)

class LoadWords(APIView):
    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        group_objs = request_json['groups']

        tweet_objects = models.Tweet.objects.all()
        # serializer return string, so convert it to list with eval()
        tweet_objects_json = eval(serializers.serialize('json', tweet_objects))
        groups = [ group_obj['idx'] for group_obj in group_objs ]

        tweets_json = []
        word_tokens = [] # All importance word apperances from all second-level features
        for tweet_idx, tweet in enumerate(tweet_objects_json):
            tweet_json = tweet['fields']
            tweet_json.update({ 'tweet_id': tweet['pk'] })
            tweets_json.append(tweet_json)

            word_tokens.append({ 'word': tweet_json['valence_seq'], 'group': tweet_json['grp'] })
            word_tokens.append({ 'word': tweet_json['dominance_seq'], 'group': tweet_json['grp'] })
            word_tokens.append({ 'word': tweet_json['fairness_seq'], 'group': tweet_json['grp'] })
            word_tokens.append({ 'word': tweet_json['care_seq'], 'group': tweet_json['grp'] })
            # word_tokens.append({ 'word': tweet_json['loyalty_seq'], 'group': tweet_json['grp'] })
            # word_tokens.append({ 'word': tweet_json['authority_seq'], 'group': tweet_json['grp'] })
            # word_tokens.append({ 'word': tweet_json['purity_seq'], 'group': tweet_json['grp'] })
        
        # Orgainze word tokens as unique words and their frequencies
        word_count_dict = {}
        for word_dict in word_tokens:
            if word_dict['word'] in word_count_dict.keys():
                word_count_dict[word_dict['word']][word_dict['group']] += 1
                word_count_dict[word_dict['word']]['count_total'] += 1
            else:
                word_count_dict[word_dict['word']] = {}
                word_count_dict[word_dict['word']]['count_total'] = 0
                for group in groups:  # Create keys for all groups
                    word_count_dict[word_dict['word']][str(group)] = 0
        #word_count_dict = dict(Counter(word_tokens)) # { 'dog': 2, 'cat': 1, ... }
        df_word_count = pd.DataFrame()
        
        df_word_list = pd.DataFrame(list(word_count_dict.keys()), columns=['word'])
        df_word_count_per_group = pd.DataFrame.from_dict(list(word_count_dict.values()))

        df_word_count = pd.concat([ df_word_list, df_word_count_per_group ], axis=1)

        df_word_count['word'] = df_word_count['word'].map(lambda x: x.encode('unicode-escape').decode('utf-8'))
        df_word_count.to_csv('word_count.csv', sep='\t', encoding = 'utf-8', index_label='idx')
        # Filter out words with threshold
        df_filtered_word_count = df_word_count.loc[df_word_count['count_total'] > 10]
        

        return Response(df_filtered_word_count.to_dict(orient='records')) # [{ 'word': 'dog', 'count': 2 }, { ... }, ...]

# For the global interpretability,
class SearchTweets(APIView):
    def get(self, request, format=None):
        pass
    
    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        keywords = request_json['searchKeyword'].split(' ')
        
        content_q = Q()
        for keyword in keywords:
            content_q &= Q(content__contains=keyword)

        retrieved_tweet_objects = models.Tweet.objects.filter(content_q)
        tweet_objects_json = eval(serializers.serialize('json', retrieved_tweet_objects))

        tweets_json = [ tweet['fields'] for tweet in tweet_objects_json ]

        return Response(tweets_json)

class RunDecisionTree(APIView):
    def get(self, request, format=None):
        pass

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        feature_objs = request_json['selectedFeatures']
        features = [feature['key'] for feature in feature_objs]
        tweets = request_json['tweets']

        # tweet_objects = models.Tweet.objects.all()
        # tweet_objects_json = eval(serializers.serialize('json', tweet_objects)) # serializer return string, so convert it to list with eval()
        # tweets_json = [ tweet['fields'] for tweet in tweet_objects_json ]

        df_tweets = pd.DataFrame(tweets)
        lb = preprocessing.LabelBinarizer()

        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))  # con: 0, lib: 1
        y = np.ravel(y)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
        

        if len(feature_objs) == 8: # if all features are selected, just load the saved model
            clf = load_model('dt_all')
        else:
            clf = DecisionTreeClassifier(max_depth=9, random_state=42)
            tree = clf.fit(X_train, y_train)
            
        feature_imps = clf.feature_importances_
        y_pred_binary = clf.predict(X)
        y_pred_prob = clf.predict_proba(X)
        y_pred_string = lb.inverse_transform(y_pred_binary)
        df_tweets['pred'] = y_pred_string
        df_tweets['prob'] = [probs[1] for probs in y_pred_prob]  # Extract the prob of tweet being liberal

        y_pred_for_test = clf.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred_for_test)
        scores = cross_validate(clf, X, y, cv=10)['test_score']

        print('accuracy: ', accuracy)
        save_model(clf, 'dt_all')

        return Response({
            'modelId': 'dt_all',
            'tweets': df_tweets.to_json(orient='records'),
            'features': features,
            'accuracy': accuracy,
            'featureImps': feature_imps
        })

        
# class RunClustering(APIView):

#     def get(self, request, format=None):
#         selected_features = ['valence', 'dominance', 'care', 'fairness']
#         tweet_objects = models.Tweet.objects.all()
#         # serializer return string, so convert it to list with eval()
#         tweet_objects_json = eval(serializers.serialize('json', tweet_objects))
#         tweets_json = [tweet['fields'] for tweet in tweet_objects_json]

#         df_tweets = pd.DataFrame(tweets_json)

#         # Clustering all together
#         df_tweets_selected = df_tweets[selected_features]
#         fit_cls = AgglomerativeClustering(n_clusters=10).fit(df_tweets_selected)
#         cls_labels = fit_cls.labels_
#         df_tweets['clusterId'] = cls_labels

#         df_tweets_by_cluster = df_tweets.groupby(['clusterId'])
#         num_tweets_per_group = df_tweets_by_cluster.size()

#         df_group_ratio = df_tweets_by_cluster.agg({
#             'grp': lambda x: math.ceil((x.loc[x == '1'].shape[0] / x.shape[0]) * 100) / 100
#         }).rename(columns={'grp': 'group_lib_ratio'})

#         # Clustering per each goal's features
#         goals_features = [
#             { 'goal': 'emotion', 'features': ['valence', 'dominance'] },
#             { 'goal': 'moral', 'features': ['care', 'fairness'] }
#         ]

#         clusters_per_goals = []
#         for goal_features in goals_features:
#             goal = goal_features['goal']
#             df_tweets_per_goal = df_tweets_selected[goal_feature['features']]
#             fit_cls = AgglomerativeClustering(n_clusters=4).fit(df_tweets_selected)
#             cls_labels = fit_cls.labels_
#             df_tweets_per_goal['clusterIdFor' + capitalize(goal)] = cls_labels

#             df_clusters_per_goal = df_tweets_per_goal.agg({
#                 'grp': lambda x: math.ceil((x.loc[x == '1'].shape[0] / x.shape[0]) * 100) / 100
#             }).rename(columns={'grp': 'group_lib_ratio'})

#             clusters_per_goal = { 
#                 'goal': 'emotion', 
#                 'clusters': df_clusters_per_goal.to_json(orient='records')
#             }
#             clusters_per_goal.append(clusters_per_goal)

#         print('clusters_per_goal')
#         print(clusters_per_goal)
#         # Save all results for clustering-all
#         df_clusters = pd.DataFrame({
#             'clusterId': list(df_tweets_by_cluster.groups),
#             'numTweets': num_tweets_per_group,
#             'groupRatio': df_group_ratio['group_lib_ratio'],
#             'pdpValue': 0.2
#             # 'tweetIds': tweet_ids_per_cluster_list
#         })

#         cluster_ids = cls_labels

#         return Response({
#             'clusterIdsForTweets': cluster_ids,
#             'clusters': df_clusters.to_json(orient='records'),
#             'clustersPerGoal': clusters_per_goal
#         })


class CalculatePartialDependence(APIView):

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        model_id = request_json['currentModelInfo']['id']
        tweets = request_json['tweets']
        feature_objs = request_json['features']
        features = [feature['key'] for feature in feature_objs]

        df_tweets = pd.DataFrame(tweets)

        lb = preprocessing.LabelBinarizer()
        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        model = load_model(model_id)

        pdp_values_list = {}
        for feature_idx, feature in enumerate(features):
            pdp_values, feature_values = partial_dependence(model, X, [feature_idx], percentiles=(0, 1))   # 0 is the selected feature index
            pdp_values_list.append({
              'feature': feature,
              'values': pd.DataFrame({ 'pdpValue': pdp_values, 'featureValue': feature_values }).to_json(orient='index')
            })

        # performance

        return Response({
            'modelId': model,
            'pdpValues': pdp_values_list
        })


class RunClusteringAndPartialDependenceForClusters(APIView):

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        model_id = request_json['modelId']
        feature_objs = request_json['features']
        features = [feature['key'] for feature in feature_objs]
        tweets = request_json['tweets']
        groups = request_json['groups']

        # tweet_objects = models.Tweet.objects.all()
        # tweet_objects_json = eval(serializers.serialize('json', tweet_objects)) # serializer return string, so convert it to list with eval()
        # tweets_json = [ tweet['fields'] for tweet in tweet_objects_json ]

        df_tweets = pd.DataFrame(tweets)
        df_tweets_selected = df_tweets[features]

        # Run clustering
        fit_cls = AgglomerativeClustering(n_clusters=10).fit(df_tweets_selected)
        cls_labels = fit_cls.labels_
        df_tweets['clusterId'] = cls_labels
        df_tweets_by_cluster = df_tweets.groupby(['clusterId'])
        num_tweets_per_group = df_tweets_by_cluster.size()

        df_group_ratio = df_tweets_by_cluster.agg({
            'group': lambda x: math.ceil((x.loc[x == '1'].shape[0] / x.shape[0]) * 100) / 100
        }).rename(columns={'group': 'group_lib_ratio'}) # '1': lib

        # Clustering per each goal's features
        goals_features = [
            { 'goal': 'emotion', 'features': ['valence', 'dominance'] },
            { 'goal': 'moral', 'features': ['care', 'fairness', 'loyalty', 'authority', 'purity'] }
        ]

        clusters_per_goals = []
        for goal_features in goals_features:
            goal = goal_features['goal']
            features_in_goal = goal_features['features']
            df_tweets_per_goal = df_tweets[goal_features['features'] + ['group']]
            fit_cls = AgglomerativeClustering(n_clusters=4).fit(df_tweets_per_goal)
            cls_labels_for_goal = fit_cls.labels_
            df_tweets_per_goal['clusterId'] = cls_labels_for_goal
            df_tweets_per_goal_by_cluster = df_tweets_per_goal.groupby(['clusterId'])

            # Define aggregated functions
            agg_dict = {}
            agg_dict['group'] = lambda x: math.ceil((x.loc[x == '1'].shape[0] / x.shape[0]) * 100) / 100  # group ratio
            agg_dict['clusterId'] = lambda x: x.count() / df_tweets.shape[0]  # size of cluster (# of tweets)
            for feature in features_in_goal:  # mean feature values
                agg_dict[feature] = lambda x: x.mean()
            
            df_clusters_per_goal = df_tweets_per_goal_by_cluster.agg(agg_dict).rename(columns={
                'group': 'group_lib_ratio',
                'clusterId': 'countRatio'
            })

            clusters_per_goal = { 
                'goal': goal, 
                'clusters': df_clusters_per_goal.to_dict(orient='records')
            }
            clusters_per_goals.append(clusters_per_goal)

        # Prepare data for partial dependence (PD)
        lb = preprocessing.LabelBinarizer()
        X = df_tweets[features]
        X_for_groups = []
        for group_idx, group in enumerate(groups):
            X_group = X.loc[df_tweets['group'] == str(group_idx)]
            X_for_groups.append(X_group)
        
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        #model = load_model(model_id)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
        model = DecisionTreeClassifier(random_state=20)
        tree = model.fit(X_train, y_train)

        # Calculate PD-all
        pdp_values_for_all = []
        for feature_idx, feature in enumerate(features):
            pdp_values, feature_values = partial_dependence(model, X, [feature_idx], percentiles=(0, 1))   # 0 is the selected feature index
            pdp_values_json = pd.DataFrame({ 'pdpValue': pdp_values[0], 'featureValue': feature_values[0] }).to_dict(orient='records')
            
            pdp_values_for_all.append({ 'feature': feature, 'values': pdp_values_json })

        # Calculate PD-per-group
        pdp_values_for_groups = []
        for group_idx, group in enumerate(groups):
            pdp_values_for_features = []
            for feature_idx, feature in enumerate(features):
                pdp_values, feature_values = partial_dependence(model, X_for_groups[group_idx], [feature_idx], percentiles=(0, 1))
                pdp_values_for_group = pdp_values[0]
                
                # Do 1 - (probability) if the group is not true class (since probability is possibility of being the group 1 (blue team))
                if group_idx == 0:
                    print('pdp_values_for_group_before: ', group_idx, pdp_values_for_group)
                    pdp_values_for_group = [ 1- pdp_value for pdp_value in pdp_values_for_group ]
                
                print('pdp_values_for_group: ', group_idx, pdp_values_for_group)
                pdp_values_json = pd.DataFrame({ 'pdpValue': pdp_values_for_group, 'featureValue': feature_values[0] }).to_dict(orient='records')
                pdp_values_for_features.append({ 'feature': feature, 'values': pdp_values_json })

            pdp_values_for_groups.append({ 'group': group, 'valuesForFeatures': pdp_values_for_features })

        # Calculate PD-per-clusters (for all and for groups)
        pdp_values_for_cls = []
        pdp_values_for_cls_and_groups = []
        instances_for_clusters = []
        # df_tweets_by_cluster.to_csv('./app/static/df_tweets_by_cluster.csv')
        for cl_idx in df_tweets_by_cluster.groups.keys():
            # Prepare data for PD per cluster
            indexes = df_tweets_by_cluster.groups[cl_idx]
            df_tweets_in_cluster = df_tweets.loc[indexes]
            X_cl = df_tweets_in_cluster[features]

            X_for_groups = []
            for group_idx, group in enumerate(groups):
                X_group = X_cl.loc[df_tweets['group'] == str(group_idx)]
                X_for_groups.append(X_group)

            # for all
            pdp_values_for_features = []
            for feature_idx, feature in enumerate(features):
                pdp_values_cl, feature_values_cl = partial_dependence(model, X_cl, [feature_idx], percentiles=(0, 1))   # 0 is the selected feature index
                pdp_values_cl_json = pd.DataFrame({ 'pdpValue': pdp_values_cl[0], 'featureValue': feature_values_cl[0] }).to_dict(orient='records')
                pdp_values_for_features.append({ 'cluster': cl_idx, 'feature': feature, 'values': pdp_values_cl_json })
            
            pdp_values_for_cls.append({ 'cluster': cl_idx, 'valuesForFeatures': pdp_values_for_features })

            # for groups
            for group_idx, group in enumerate(groups):
                pdp_values_for_cls_and_features = []
                for feature_idx, feature in enumerate(features):
                    pdp_values, feature_values = partial_dependence(model, X_for_groups[group_idx], [feature_idx], percentiles=(0, 1))
                    pdp_values_cl_for_group = pdp_values[0]

                    if group_idx == 0:
                        print('pdp_values_for_group_before: ', group_idx, pdp_values_for_group)
                        pdp_values_cl_for_group = [ 1- pdp_value for pdp_value in pdp_values_cl_for_group ]

                    pdp_values_cl_json = pd.DataFrame({ 'pdpValue': pdp_values_cl_for_group, 'featureValue': feature_values[0] }).to_dict(orient='records')
                    pdp_values_for_cls_and_features.append({ 'feature': feature, 'values': pdp_values_cl_json })
                
                pdp_values_for_cls_and_groups.append({ 'cluster': cl_idx, 'group': group, 'valuesForFeatures': pdp_values_for_cls_and_features })

        # Results
        cluster_ids = cls_labels

        df_clusters = pd.DataFrame({
            'clusterId': list(df_tweets_by_cluster.groups),
            'numTweets': num_tweets_per_group,
            'groupRatio': df_group_ratio['group_lib_ratio']
        })

        # for cl_idx in range(len(cat_permutations)):
        #     df_instances_for_lv['idx'] = list(df_instances_for_lv.index)
        #     instances_idx_for_cl = cls_idx_list[cl_idx]
        #     prototypes_idx_for_cl = protos_idx_list[cl_idx]
        #     instances_for_cl = df_instances_for_lv.loc[instances_idx_for_cl]
        #     prototypes_for_cl = df_instances_for_lv.loc[prototypes_idx_for_cl]
        #     prototype_feature_list = [ {'name': feature_name, 'value': feature_value } for feature_name, feature_value in prototypes_for_cl.to_dict().items() if feature_name != 'idx' ]
        #     prototype = {
        #         'idx': df_instances_for_lv.loc[prototypes_idx_for_cl, 'idx'],
        #         'features': prototype_feature_list  # [ {'name': 'air pollution', 'value': 1}, ... ]
        #     }

        #     cl_list.append({
        #         'idx': cl_idx,
        #         'lvIdx': lv_idx,
        #         'sortedIdx': cl_idx,
        #         'instances': instances_for_cl.to_dict('records'),
        #         'prototype': prototype
        #     })

        return Response({
            'clusters': df_clusters.to_dict(orient='records'),
            # 'instances': df_tweets.to_dict(orient),
            'clusterIdsForTweets': list(cluster_ids),
            'clustersForGoals': clusters_per_goals,
            'pdpValues': pdp_values_for_all,
            'pdpValuesForGroups': pdp_values_for_groups,
            'pdpValuesForCls': pdp_values_for_cls,
            'pdpValuesForClsGroups': pdp_values_for_cls_and_groups
        })

class FindContrastiveExamples(APIView):

    def post(self, request, format=None):
        features = ['valence', 'dominance', 'care', 'fairness', 'loyalty', 'authority', 'purity']
        request_json = json.loads(request.body.decode(encoding='UTF-8'))

        # print('request_json in findcontrastiveexamples:', request_json)
        q_type = request_json['qType']
        selected_tweet = request_json['selectedTweet']
        second_selected_tweet = request_json['secondSelectedTweet']
        tweets = request_json['tweets']
        model_id = request_json['currentModelInfo']['id']

        # Load the model and parse it as decision tree
        tweets = sorted(tweets, key=lambda k: k['tweetIdx'])
        df_tweets = pd.DataFrame(tweets)
        df_tweets.to_csv('df_tweets_checking.csv')
        
        lb = preprocessing.LabelBinarizer()
        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))  # con: 0, lib: 1
        y = np.ravel(y)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
        
        clf = load_model(model_id)
        clf.fit(X_train, y_train)
        y_pred_binary = clf.predict(X) # restore prediction results
        y_pred_prob = clf.predict_proba(X)
        y_pred_string = lb.inverse_transform(y_pred_binary)
        df_tweets['pred'] = y_pred_string
        df_tweets['prob'] = [probs[1] for probs in y_pred_prob]  # Extract the prob of tweet being liberal

        # visualize the tree
        # dot_data = StringIO()
        # out = export_graphviz(clf, out_file=dot_data)
        # graph = pydot.graph_from_dot_data(dot_data.getvalue())

        time_check1 = time.time()
        # Construct entries and leaves information
        rules_list, values_path, leaves_index = get_rules(clf, X)
        entries = collections.defaultdict(list) # entries are tweets
        dec_paths = clf.decision_path(X)

        for d, dec in enumerate(dec_paths):
            for i in range(clf.tree_.node_count):
                if dec.toarray()[0][i] == 1:
                    entries[i].append(d)

        time_check2 = time.time()
                    
        leaves_class = []
        num_cons = []
        num_libs = []
        entry_idx = []
        print('first leaf: ', leaves_index[0])
        for idx, leaf_idx in enumerate(leaves_index):
            num_con, num_lib = values_path[idx][-1][0]
            leaf_class = 1 if (num_con < num_lib) else 0
            leaves_class.append(leaf_class)
            num_cons.append(num_con)
            num_libs.append(num_lib)
            print(entries[leaf_idx])
            entry_idx.append(entries[leaf_idx])

        time_check3 = time.time()

        print('entry_idx: ', entry_idx)
        print('leaves_index: ', leaves_index)

        df_leaves = pd.DataFrame({ 
            'idx': leaves_index,
            'rule': rules_list,  
            'entriesIdx': entry_idx, 
            'numLibTweets': num_libs, 
            'numConTweets': num_cons,
            'class': leaves_class
        }, index=leaves_index)
        entry_leaf_idx = {} 
        for entries, leaf in zip(entry_idx, leaves_index):
            for entry in entries:
                entry_leaf_idx[entry] = leaf

        time_check4 = time.time() - time_check1

        # Start to retrieve the example, given the selected tweet
        #-- Detect where the selected tweet belongs (by index and what node the index resides in)
        if q_type == 'p-mode':
            selected_tweet_idx = selected_tweet['tweetIdx']
            leaf_idx = entry_leaf_idx[selected_tweet_idx]
            print('selected_tweet: ', selected_tweet)
            #-- Identify the predicted class
            leaf = df_leaves.loc[leaf_idx]
            #-- Find a neighbor leaf that is predicted as the opposite but also the closest to the leaf
            
            leaf_class = leaf['class']
            entries_w_opp_class = df_leaves.loc[df_leaves['class'].astype('int64') != int(leaf['class'])]
            leaf_idx_diff = abs(entries_w_opp_class['idx'] - int(leaf['idx']))
            print('leaf_idx_diff: ', leaf_idx_diff)
            leaf_idx_diff.to_csv('leaf_idx_diff.csv')
            cont_leaf_idx = leaf_idx_diff.idxmin()
            cont_leaf = entries_w_opp_class.loc[cont_leaf_idx]
            print('leaf: ', leaf['entriesIdx'])
            # print('leaf: ', leaf)
            print('cont_leaf: ', cont_leaf['entriesIdx'])

            df_tweets_in_selected_leaf = df_tweets.loc[leaf['entriesIdx']]
            df_tweets_in_selected_leaf.to_csv('df_tweets_in_selected_leaf.csv')
            df_tweets_in_cont_leaf = df_tweets.loc[cont_leaf['entriesIdx']]
            df_tweets_in_cont_leaf.to_csv('df_tweets_in_cont_leaf.csv')
            df_correct_pred_tweets_in_cont_leaf = df_tweets_in_cont_leaf.loc[ df_tweets_in_cont_leaf['group'].astype('int64') == df_tweets_in_cont_leaf['pred'].astype('int64') ]
            df_correct_pred_tweets_in_cont_leaf.to_csv('df_correct_pred_tweets_in_cont_leaf.csv')

            cont_leaf_rules = cont_leaf['rule']
            selected_leaf_rules = leaf['rule']
            print('cont_leaf_rules: ', cont_leaf_rules)
            print('selected_leaf_rules: ', selected_leaf_rules)

            #-- Identify rule difference  e.g., "Selected tweet has higher fairness than tweet 176"
            num_rules_cont_leaf = len(cont_leaf_rules)
            num_rules_selected_leaf = len(selected_leaf_rules)

            diff_rules_idx = []
            cont_rule_subject = 'selectedTweet'
            for rule_idx in range(0, min(num_rules_cont_leaf, num_rules_selected_leaf)): # go over all rules but up to the index of shorter rule list
                if cont_leaf_rules[rule_idx] != selected_leaf_rules[rule_idx]:
                    diff_rules_idx.append(rule_idx)
                    break

            # if num_rules_cont_leaf > num_rules_selected_leaf: # e.g., rules-for-selected-leaf: [A,B,C], rules-for-cont-leaf: [A,B,C,D]
            #     diff_rules_idx = range(num_rules_selected_leaf-1, num_rules_cont_leaf, 1)
            #     rules_from_longer_leaf = cont_leaf_rules
            #     cont_rule_subject = 'contTweet'
            # elif num_rules_cont_leaf == num_rules_selected_leaf:
            #     if cont_leaf_rules[num_rules_cont_leaf-1][0] != selected_leaf_rules[num_rules_selected_leaf-1][0]:
            #         # e.g., when rules-for-selected-leaf: [A,B,C,D], rules-for-cont-leaf: [A,B,C,E], grab C
            #         diff_rules_idx = range(num_rules_selected_leaf-2, num_rules_selected_leaf-1, 1)
            #         rules_from_longer_leaf = selected_leaf_rules
            #         cont_rule_subject = 'selectedTweet'
            #     else:
            #         diff_rules_idx = range(num_rules_cont_leaf-1, num_rules_selected_leaf, 1)
            #         rules_from_longer_leaf = selected_leaf_rules
            #         cont_rule_subject = 'selectedTweet'
            # else:
            #     diff_rules_idx = range(num_rules_cont_leaf-1, num_rules_selected_leaf, 1)
            #     rules_from_longer_leaf = selected_leaf_rules
            #     cont_rule_subject = 'selectedTweet'

            cont_rules_dict = {}
            for i, rule_idx in enumerate(diff_rules_idx): # compare two leaves and see the difference in rules
                [ feature, inequality, threshold ] = selected_leaf_rules[rule_idx].split(' ')
                if feature not in cont_rules_dict.keys(): # if there is no currently overlapped feature rule in cont_rules_dict
                    cont_rules_dict[feature] = { 
                        'subject': cont_rule_subject,
                        'inequality': inequality, 
                        'threshold': threshold
                    }
                else: # if overlapped feature rule exists
                    existing_inequality = cont_rules_dict[feature]['inequality']
                    existing_threshold = cont_rules_dict[feature]['threshold']
                    
                    if cont_rules_dict[feature]['inequality'] == existing_inequality:
                        if inequality == '>' or inequality == '>=':
                            updated_threshold = max(threshold, existing_threshold)
                        else:
                            updated_threshold = min(threshold, existing_threshold)
                        cont_rules_dict[feature] = { 
                            'subject': cont_rule_subject,
                            'inequality': inequality, 
                            'threshold': threshold
                        }
                    else:
                        print('unexpected.')
            
            # Identify feature-level contrastive example
            cont_examples_list = []
            for cont_feature, cont_rule in cont_rules_dict.items():
                print('cont_feature_and_rule: ', cont_feature, cont_rule)
                # Find the examples where rest of features are similar to the selected tweet
                rest_features = [ feature for feature in features if feature != cont_feature ]
                df_correct_pred_opp_class_tweets_in_cont_leaf = df_correct_pred_tweets_in_cont_leaf.loc[ 
                    df_correct_pred_tweets_in_cont_leaf['group'].astype('int64') != int(leaf_class) ]
                X_in_cont_leaf = df_correct_pred_opp_class_tweets_in_cont_leaf[rest_features]

                dist_list = []
                selected_tweet_series = X.loc[selected_tweet_idx]
                dists = euclidean_distances([selected_tweet_series[rest_features]], X_in_cont_leaf)

                # Grab the closest tweet but one that belongs to the opposite group
                nn_idx = 0
                while len(cont_examples_list) == 0: # until we find the counterfactual example in the counterfactual leaf
                    optimal_tweet_idx = np.argmin(dists[nn_idx])
                    optimal_tweet = df_correct_pred_tweets_in_cont_leaf.iloc[optimal_tweet_idx]
                    print('optimal_tweet_candidate: ', optimal_tweet)
                    print('selected_tweet: ', selected_tweet)
                    if optimal_tweet['group'] == selected_tweet['group']: # counterfactual should be one that belongs to the opposite group
                        nn_idx += 1
                        break
                    else:
                        cont_example_dict = df_correct_pred_tweets_in_cont_leaf.iloc[optimal_tweet_idx].to_dict()
                        cont_example_dict['contFeature'] = cont_feature
                        cont_example_dict['pdpValue'] = 0
                        cont_examples_list.append(cont_example_dict)
                        for cont_example in cont_examples_list:
                            print('cont_example: ', cont_example)
                
        elif q_type == 'o-mode':
            # detect where the selected tweet belongs (by index and what node the index resides in)
            first_tweet_idx = selected_tweet['tweetIdx']
            second_tweet_idx = second_selected_tweet['tweetIdx']
            first_tweet = X.loc[first_tweet_idx]
            second_tweet = X.loc[second_tweet_idx]

            first_leaf = df_leaves.loc[ df_leaves['idx'] == entry_leaf_idx[first_tweet_idx] ] # identify the predicted class
            second_leaf = df_leaves.loc[ df_leaves['idx'] == entry_leaf_idx[second_tweet_idx] ]

            first_leaf_rules = first_leaf['rule'].values[0]
            second_leaf_rules = second_leaf['rule'].values[0]
                
            num_rules_second_leaf = len(first_leaf_rules)
            num_rules_first_leaf = len(second_leaf_rules)

            if num_rules_first_leaf < num_rules_second_leaf:
                num_longer_rules = num_rules_second_leaf
                num_shorter_rules = num_rules_first_leaf
                longer_leaf_rules = num_rules_second_leaf
                longer_leaf = 'second'
            else:
                num_longer_rules = num_rules_first_leaf
                num_shorter_rules = num_rules_second_leaf
                longer_leaf_rules = num_rules_first_leaf
                longer_leaf_rules = num_rules_first_leaf
                longer_leaf = 'first'

            diff_rule = {}
            for rule_idx in range(num_longer_rules):
                if rule_idx >= num_shorter_rules: # When the length is different and overlapped rules are the same
                    [ feature, inequality, threshold ] = longer_leaf_rules[rule_idx].split(' ')
                    if longer_leaf == 'first':
                        subject = 'first'
                    else:
                        subject = 'second'
                    diff_rule = {
                        'subject': subject,
                        'feature': feature,
                        'inequality': inequality,
                        'threshold': threshold
                    }
                    break
                else:
                    if first_leaf_rules[rule_idx] != second_leaf_rules[rule_idx]:
                        [ feature, inequality, threshold ] = first_leaf_rules[rule_idx].split(' ')
                        diff_rule = first_leaf_rules[rule_idx]
                        diff_rule = {
                            'subject': 'first',
                            'feature': feature,
                            'inequality': inequality,
                            'threshold': threshold
                        }
                        break
            
        time_check5 = time.time() - time_check1
        print('time-check: ', time_check1, time_check2, time_check3, time_check4, time_check5)
        if q_type == 'p-mode':
            return Response({ 'qType': q_type, 'contExamples': cont_examples_list, 'contRules': cont_rules_dict, 'selectedTweetRules': selected_leaf_rules })
        elif q_type == 'o-mode':
            return Response({ 'qType': q_type, 'diffRule': diff_rule })

class CalculateTFIDFAndCooc(APIView): # Calculate TFIDF and Co-occurrence matrix
    def post(self, request, format=None):
        # tweets and words
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        tweets = request_json['tweets']
        words = request_json['words']
        tweet_contents = [ tweet['content'] for tweet in tweets ]

        unique_words = [ word_obj['word'] for word_obj in words ] # Do any filtering if needed (currently just assigning it)

        # Load precomputed tf-idf score from the file
        # df_tfidf = pd.read_csv('./app/static/data/tfidf_tribal_tweets.csv', index_col='idx')
        chunks = pd.read_csv('./app/static/data/tfidf_tribal_tweets.csv', chunksize=1000)
        df_tfidf = pd.concat(chunks, ignore_index=True)
        df_tfidf = df_tfidf.set_index('idx')
        # Dynamic calculation
        # tf-idf
        # cvect = CountVectorizer(ngram_range=(1,1), token_pattern='(?u)\\b\\w+\\b')
        # counts = cvect.fit_transform(tweet_contents)
        # normalized_counts = normalize(counts, norm='l1', axis=1)

        # tfidf = TfidfVectorizer(ngram_range=(1,1), token_pattern='(?u)\\b\\w+\\b', smooth_idf=False)
        # tfs = tfidf.fit_transform(tweet_contents)
        # new_tfs = normalized_counts.multiply(tfidf.idf_)

        # feature_names = tfidf.get_feature_names()
        # df_tfidf = pd.DataFrame(new_tfs.T.todense(), index=feature_names, columns=range(len(tweet_contents)))
        df_tfidf_for_selected_words = df_tfidf.reindex(unique_words)
        #tfidf_dict = df_tfidf.to_dict(orient='records')

        # co-occurrence
        cooccurrence_mat = df_tfidf_for_selected_words.dot(df_tfidf_for_selected_words.T).fillna(0)
        np.fill_diagonal(cooccurrence_mat.values, 0)
        cooc_dict = cooccurrence_mat.to_dict(orient='dict')

        return Response({'tfidf': {}, 'cooc': cooc_dict})


class ExtractSeqs(APIView):
    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        mode = request_json['mode'] # all or cluster
        opt = request_json['opt']
        tweet_ids = request_json['tweetIds']
        weights = request_json['seqWeights']

        print('mode: ', mode, opt)
        print('lenngth of tweets: ', len(tweet_ids))

        if opt == 'static':
            f = open('./app/static/data/imp_seqs.json', "r") 
            imp_seqs = json.loads(f.read())
        else:
            feature_list = ['v','d','a','f','h','l','p']
            imp_seqs = {}

            for feature in feature_list:
                print('feature: ', feature)
                imp_seqs[feature] = []
                test = dl.model_loader(feature, mode, tweet_ids, weights['post'], weights['ranking'], weights['length'], weights['freq'], None)
                tid_group_post_dict = test.normalize_group_posterior()
                tid_construct_post_dict = test.normalize_construct_posterior()
                tid_score_dict = test.normalize_imp_score()
                tid_att_for_seq_dict = test.get_attentions_for_seqs()

                df_feature_values = pd.DataFrame(list(tid_construct_post_dict.values()), columns=['feature_value'], index=tid_construct_post_dict.keys())
                if feature == 'f':
                    df_feature_values['feature_value'] = df_feature_values['feature_value'].map({0:1, 1:2, 2:0})
                elif feature == 'p':
                    df_feature_values['feature_value'] = df_feature_values['feature_value'].map({0:0, 1:2, 2:1})
                elif feature == 'a' or feature == 'l':
                    df_feature_values['feature_value'] = df_feature_values['feature_value'].map({0:0, 1:3, 2:2, 3:1})
                elif feature == 'h':
                    df_feature_values['feature_value'] = df_feature_values['feature_value'].map({0:0, 1:3, 2:2, 3:1})
                
                data, tweets = test.get_most_important(n=10)
                for tid in tweets:
                    imp_seqs[feature].append({
                        'seq': ' '.join(data[tid]['seq']),
                        'attForSeq': tid_att_for_seq_dict[tid],
                        'score': tid_score_dict[tid],
                        'featureProb': df_feature_values.loc[tid],
                        'groupProb': tid_group_post_dict[tid],
                    })

        return Response({'seqs': imp_seqs })