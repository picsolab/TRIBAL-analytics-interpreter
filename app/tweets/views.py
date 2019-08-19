from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
from django.contrib.postgres.search import SearchQuery, SearchVector
from django.db.models import Q

from rest_framework import status
from . import models

import pandas as pd
import numpy as np
import json, math, pickle, collections, pydot
from sklearn.tree import DecisionTreeClassifier, export_graphviz
from sklearn.cluster import AgglomerativeClustering
from sklearn.model_selection import train_test_split, cross_val_score, cross_validate
from sklearn import preprocessing
from sklearn.inspection import partial_dependence, plot_partial_dependence
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.metrics import accuracy_score

from io import StringIO


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
            tweet_json.update({ 'tweet_id': tweet['pk'] })
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

# For the global interpretability,
class SearchTweets(APIView):
    def get(self, request, format=None):
        pass
    
    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        keywords = request_json['searchKeyword'].split(' ')
        
        content_q = Q()
        for keyword in keywords:
            content_q |= Q(content__contains=keyword)

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
        clf = DecisionTreeClassifier(max_depth=6, random_state=20)
        tree = clf.fit(X_train, y_train)

        y_pred_binary = clf.predict(X)
        y_pred_prob = clf.predict_proba(X)
        y_pred_string = lb.inverse_transform(y_pred_binary)
        df_tweets['pred'] = y_pred_string
        df_tweets['prob'] = [probs[1] for probs in y_pred_prob]  # Extract the prob of tweet being liberal

        y_pred_for_test = clf.predict(X_test)
        print('accuracy: ', accuracy_score(y_test, y_pred_for_test))
        scores = cross_validate(clf, X, y, cv=10)['test_score']

        # load graph with graph_tool and explore structure as you please

        save_model(clf, 'dt_0')

        return Response({
            'modelId': 'dt_0',
            'tweets': df_tweets.to_json(orient='records')
        })


class RunClustering(APIView):

    def get(self, request, format=None):
        selected_features = ['valence', 'dominance', 'harm', 'fairness']
        tweet_objects = models.Tweet.objects.all()
        # serializer return string, so convert it to list with eval()
        tweet_objects_json = eval(serializers.serialize('json', tweet_objects))
        tweets_json = [tweet['fields'] for tweet in tweet_objects_json]

        df_tweets = pd.DataFrame(tweets_json)
        df_tweets_selected = df_tweets[selected_features]
        fit_cls = AgglomerativeClustering(n_clusters=10).fit(df_tweets_selected)
        cls_labels = fit_cls.labels_
        df_tweets['clusterId'] = cls_labels

        df_tweets_by_cluster = df_tweets.groupby(['clusterId'])
        num_tweets_per_group = df_tweets_by_cluster.size()

        df_group_ratio = df_tweets_by_cluster.agg({
            'grp': lambda x: math.ceil((x.loc[x == '1'].shape[0] / x.shape[0]) * 100) / 100
        }).rename(columns={'grp': 'group_lib_ratio'})

        df_clusters = pd.DataFrame({
            'clusterId': list(df_tweets_by_cluster.groups),
            'numTweets': num_tweets_per_group,
            'groupRatio': df_group_ratio['group_lib_ratio'],
            'pdpValue': 0.2
            # 'tweetIds': tweet_ids_per_cluster_list
        })

        cluster_ids = cls_labels

        return Response({
            'clusterIdsForTweets': cluster_ids,
            'clusters': df_clusters.to_json(orient='records')
        })


class CalculatePartialDependence(APIView):

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        model_id = request_json['modelId']
        tweets = request_json['tweets']
        feature_objs = request_json['features']
        features = [feature['key'] for feature in feature_objs]

        df_tweets = pd.DataFrame(tweets)

        lb = preprocessing.LabelBinarizer()
        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        model = load_model(model_id)

        pdp_values_dict = {}
        for feature_idx, feature in enumerate(features):
            pdp_values, feature_values = partial_dependence(model, X, [feature_idx], percentiles=(0, 1))   # 0 is the selected feature index
            pdp_values_dict[feature] = pd.DataFrame({ 'pdpValue': pdp_values, 'featureValue': feature_values }).to_json(orient='index')

        # performance

        return Response({
            'modelId': model,
            'pdpValues': pdp_values_dict
        })


class RunClusteringAndPartialDependenceForClusters(APIView):

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        model_id = request_json['modelId']
        feature_objs = request_json['features']
        features = [feature['key'] for feature in feature_objs]
        tweets = request_json['tweets']

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

        # Calculate partial dependence
        lb = preprocessing.LabelBinarizer()
        X = df_tweets[features]
        X_con = df_tweets.loc[df_tweets['group'] == '0', features]
        X_lib = df_tweets.loc[df_tweets['group'] == '1', features]
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        model = load_model(model_id)
        pdp_values_dict = {}
        pdp_values_for_con_dict = {}
        pdp_values_for_lib_dict = {}
        for feature_idx, feature in enumerate(features):
            pdp_values, feature_values = partial_dependence(model, X, [feature_idx], percentiles=(0, 1))   # 0 is the selected feature index
            pdp_values_for_con, feature_values_for_con = partial_dependence(model, X_con, [feature_idx], percentiles=(0, 1))
            pdp_values_for_lib, feature_values_for_lib = partial_dependence(model, X_lib, [feature_idx], percentiles=(0, 1))
            
            pdp_values_json = pd.DataFrame({ 'pdpValue': pdp_values[0], 'featureValue': feature_values[0] }).to_json(orient='records')
            pdp_values_for_con_json = pd.DataFrame({ 'pdpValue': pdp_values_for_con[0], 'featureValue': feature_values_for_con[0] }).to_json(orient='records')
            pdp_values_for_lib_json = pd.DataFrame({ 'pdpValue': pdp_values_for_lib[0], 'featureValue': feature_values_for_lib[0] }).to_json(orient='records')
            
            pdp_values_dict[feature] = pdp_values_json
            pdp_values_for_con_dict[feature] = pdp_values_for_con_json
            pdp_values_for_lib_dict[feature] = pdp_values_for_lib_json

        # Results
        cluster_ids = cls_labels

        df_clusters = pd.DataFrame({
            'clusterId': list(df_tweets_by_cluster.groups),
            'numTweets': num_tweets_per_group,
            'groupRatio': df_group_ratio['group_lib_ratio']
        })

        return Response({
            'clusters': df_clusters.to_json(orient='records'),
            'clusterIdsForTweets': cluster_ids,
            'pdpValues': pdp_values_dict,
            'pdpValuesForCon': pdp_values_for_con_dict,
            'pdpValuesForLib': pdp_values_for_lib_dict
        })


class FindContrastiveExamples(APIView):

    def post(self, request, format=None):
        features = ['valence', 'dominance', 'harm', 'fairness']
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        q_type = request_json['qType']
        selected_tweet = request_json['selectedTweet']
        second_selected_tweet = request_json['secondSelectedTweet']
        tweets = request_json['tweets']
        model_id = request_json['currentModel']

        # Load the model and parse it as decision tree
        df_tweets = pd.DataFrame(tweets)
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

        dot_data = StringIO()
        out = export_graphviz(clf, out_file=dot_data)
        graph = pydot.graph_from_dot_data(dot_data.getvalue())

        # Construct entries and leaves information
        rules_list, values_path, leaves_index = get_rules(clf, X)
        entries = collections.defaultdict(list) # entries are tweets
        dec_paths = clf.decision_path(X)

        for d, dec in enumerate(dec_paths):
            for i in range(clf.tree_.node_count):
                if dec.toarray()[0][i]  == 1:
                    entries[i].append(d)
                    
        leaves_class = []
        num_cons = []
        num_libs = []
        entry_idx = []
        for idx, leaf_idx in enumerate(leaves_index):
            num_con, num_lib = values_path[idx][-1][0]
            leaf_class = 1 if (num_con < num_lib) else 0
            leaves_class.append(leaf_class)
            num_cons.append(num_con)
            num_libs.append(num_lib)
            entry_idx.append(entries[leaf_idx])

        df_leaves = pd.DataFrame({ 
            'idx': leaves_index,
            'rule': rules_list,  
            'entriesIdx': entry_idx, 
            'numLibTweets': num_libs, 
            'numConTweets': num_cons,
            'class': leaves_class
        })
        entry_leaf_idx = {} 
        for entries, leaf in zip(entry_idx, leaves_index):
            for entry in entries:
                entry_leaf_idx[entry] = leaf
        df_leaves.to_csv('df_leaves.csv')
        # Start to retrieve the example, given the selected tweet
        #-- Detect where the selected tweet belongs (by index and what node the index resides in)
        

        if q_type == 'p-mode':
            selected_tweet_idx = selected_tweet['tweetId']
            selected_tweet = X.loc[selected_tweet_idx]
            leaf_idx = entry_leaf_idx[selected_tweet_idx]
            #-- Identify the predicted class
            leaf = df_leaves.loc[df_leaves['idx'] == leaf_idx]
            #-- Find a neighbor leaf that is predicted as the opposite but also the closest to the leaf
            
            leaf_class = leaf['class']
            entries_w_opp_class = df_leaves.loc[df_leaves['class'].astype('int64') != int(leaf['class'])]
            leaf_idx_diff = abs(entries_w_opp_class['idx'] - int(leaf['idx']))
            cont_leaf_idx = leaf_idx_diff.idxmin()
            cont_leaf = entries_w_opp_class.loc[cont_leaf_idx]

            df_tweets_in_cont_leaf = df_tweets.loc[cont_leaf['entriesIdx']]
            df_tweets_in_cont_leaf.to_csv('df_tweets_in_cont_leaf.csv')
            df_correct_pred_tweets_in_cont_leaf = df_tweets_in_cont_leaf.loc[ df_tweets_in_cont_leaf['group'].astype('int64') == df_tweets_in_cont_leaf['pred'].astype('int64') ]
            df_correct_pred_tweets_in_cont_leaf.to_csv('df_correct_pred_tweets_in_cont_leaf.csv')

            cont_leaf_rules = cont_leaf['rule']
            selected_leaf_rules = leaf['rule'].values[0]

            #-- Identify rule difference  e.g., "Selected tweet has higher fairness than tweet 176"
            num_rules_cont_leaf = len(cont_leaf_rules)
            num_rules_selected_leaf = len(selected_leaf_rules)
            
            if num_rules_cont_leaf > num_rules_selected_leaf:
                diff_rules_idx = range(num_rules_selected_leaf-1, num_rules_cont_leaf, 1)
                rules_from_longer_leaf = cont_leaf_rules
                cont_rule_subject = 'selectedTweet'
            else:
                diff_rules_idx = range(num_rules_cont_leaf-1, num_rules_selected_leaf, 1)
                rules_from_longer_leaf = selected_leaf_rules
                cont_rule_subject = 'contTweet'

            cont_rules_dict = {}
            for i, rule_idx in enumerate(diff_rules_idx): # compare two leaves and see the difference in rules
                [ feature, inequality, threshold ] = rules_from_longer_leaf[rule_idx].split(' ')
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
                        if inequality == '>':
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
                # Find the examples where rest of features are similar to the selected tweet
                rest_features = [ feature for feature in features if feature != cont_feature ]
                df_correct_pred_opp_class_tweets_in_cont_leaf = df_correct_pred_tweets_in_cont_leaf.loc[ 
                    df_correct_pred_tweets_in_cont_leaf['group'].astype('int64') != int(leaf_class) ]
                X_in_cont_leaf = df_correct_pred_opp_class_tweets_in_cont_leaf[rest_features]

                dist_list = []
                dists = euclidean_distances([selected_tweet[rest_features]], X_in_cont_leaf)

                optimal_tweet_idx = np.argmin(dists[0])

                cont_example_dict = df_correct_pred_tweets_in_cont_leaf.iloc[optimal_tweet_idx].to_dict()
                cont_example_dict['contFeature'] = cont_feature
                cont_examples_list.append(cont_example_dict)
                
            print(cont_examples_list)
        elif q_type == 'o-mode':
            # detect where the selected tweet belongs (by index and what node the index resides in)
            print('tweets: ', selected_tweet['tweetId'], second_selected_tweet['tweetId'])
            first_tweet_idx = selected_tweet['tweetId']
            second_tweet_idx = second_selected_tweet['tweetId']
            first_tweet = X.loc[first_tweet_idx]
            second_tweet = X.loc[second_tweet_idx]
            print(first_tweet)
            print(second_tweet)

            first_leaf = df_leaves.loc[ df_leaves['idx'] == entry_leaf_idx[first_tweet_idx] ] # identify the predicted class
            second_leaf = df_leaves.loc[ df_leaves['idx'] == entry_leaf_idx[second_tweet_idx] ]

            first_leaf_rules = first_leaf['rule'].values[0]
            second_leaf_rules = second_leaf['rule'].values[0]

            print(first_leaf_rules)
            print(second_leaf_rules)
                
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
                print('rule_idx: ', rule_idx)
                print('first_leaf_rules[rule_idx]: ', first_leaf_rules[rule_idx])
                print('second_leaf_rules[rule_idx]: ', second_leaf_rules[rule_idx])
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
                        print('here')
                        [ feature, inequality, threshold ] = first_leaf_rules[rule_idx].split(' ')
                        diff_rule = first_leaf_rules[rule_idx]
                        diff_rule = {
                            'subject': 'first',
                            'feature': feature,
                            'inequality': inequality,
                            'threshold': threshold
                        }
                        break

            print(diff_rule)
            
        if q_type == 'p-mode':
            return Response({ 'qType': q_type, 'contExamples': cont_examples_list, 'contRules': cont_rules_dict })
        elif q_type == 'o-mode':
            return Response({ 'qType': q_type, 'diffRule': diff_rule })