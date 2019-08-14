from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
from django.contrib.postgres.search import SearchQuery, SearchVector

from rest_framework import status
from . import models

import pandas as pd
import numpy as np
import json, math, pickle
from sklearn.tree import DecisionTreeClassifier, export_graphviz
from sklearn.cluster import AgglomerativeClustering
from sklearn.model_selection import train_test_split
from sklearn import preprocessing
from sklearn.inspection import partial_dependence, plot_partial_dependence


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
        search_keyword = request_json['searchKeyword']
        
        retrieved_tweet_objects = models.Tweet.objects.filter(content__contains=search_keyword)
        tweet_objects_json = eval(serializers.serialize('json', retrieved_tweet_objects))

        tweets_json = [ tweet['fields'] for tweet in tweet_objects_json ]
        print(tweets_json)

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
        print('tweets: ', df_tweets.head())
        print('features: ', features)

        lb = preprocessing.LabelBinarizer()

        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))  # con: 0, lib: 1
        y = np.ravel(y)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
        clf = DecisionTreeClassifier(max_depth=6, random_state=1)
        tree = clf.fit(X_train, y_train)
        # out = export_graphviz(clf)
        # print('value from export_graphviz: ', out.getvalue())
        # print('depth: ', clf.get_depth())

        y_pred_binary = clf.predict(X)
        y_pred_prob = clf.predict_proba(X)
        y_pred_string = lb.inverse_transform(y_pred_binary)
        print('y_pred_string: ', y_pred_string)
        print('y_pred_prob: ', y_pred_prob)
        df_tweets['pred'] = y_pred_string
        df_tweets['prob'] = [probs[1] for probs in y_pred_prob]  # Extract the prob of tweet being liberal

        # Tree
        print(tree)
        # load graph with graph_tool and explore structure as you please

        save_model(clf, 'dt_0')

        return Response({
            'modelId': 'dt_0',
            'tweets': df_tweets.to_json(orient='records')
        })


class RunClustering(APIView):

    def get(self, request, format=None):
        selected_features = ['valence', 'arousal', 'dominance', 'harm', 'fairness']
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

        # tweet_ids_per_cluster_list = [ str(list(tweet_ids_per_cluster)) for tweet_ids_per_cluster in df_tweets_by_cluster.groups.values() ]
        # print('group list: ', tweet_ids_per_cluster_list)

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

        print('run clustering: ', df_clusters.to_json(orient='records'))
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

        print(features)

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
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        model = load_model(model_id)
        pdp_values_dict = {}
        for feature_idx, feature in enumerate(features):
            pdp_values, feature_values = partial_dependence(model, X, [feature_idx], percentiles=(0, 1))   # 0 is the selected feature index
            pdp_values_json = pd.DataFrame({ 'pdpValue': pdp_values[0], 'featureValue': feature_values[0] }).to_json(orient='records')
            pdp_values_dict[feature] = pdp_values_json

        # Results
        cluster_ids = cls_labels

        df_clusters = pd.DataFrame({
            'clusterId': list(df_tweets_by_cluster.groups),
            'numTweets': num_tweets_per_group,
            'groupRatio': df_group_ratio['group_lib_ratio']
        })

        print('run clustering: ', df_clusters.to_json(orient='records'))

        return Response({
            'clusters': df_clusters.to_json(orient='records'),
            'clusterIdsForTweets': cluster_ids,
            'pdpValues': pdp_values_dict
        })


class FindContrastiveExample(APIView):

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        tweet = request_json['selectedTweet']
        model = request_json['currentModel']
