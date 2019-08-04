from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
from rest_framework import status
from . import models

import pandas as pd
import numpy as np
import json
import math
import pickle
import matplotlib
from sklearn.tree import DecisionTreeRegressor
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
        tweets_json = [tweet['fields'] for tweet in tweet_objects_json]

        return Response(tweets_json)

# For the global interpretability,


class RunDecisionTree(APIView):
    def get(self, request, format=None):
        pass

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        features = request_json['selectedFeatures']
        tweets = request_json['tweets']

        # tweet_objects = models.Tweet.objects.all()
        # tweet_objects_json = eval(serializers.serialize('json', tweet_objects)) # serializer return string, so convert it to list with eval()
        # tweets_json = [ tweet['fields'] for tweet in tweet_objects_json ]

        df_tweets = pd.DataFrame(tweets)
        print('features: ', features)

        lb = preprocessing.LabelBinarizer()

        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
        clf = DecisionTreeRegressor(max_depth=15, random_state=1)
        clf.fit(X_train, y_train)

        y_pred_binary = clf.predict(X)
        y_pred_string = lb.inverse_transform(y_pred_binary)
        df_tweets['pred'] = y_pred_string

        # performance

        save_model(clf, 'dt_0')

        return Response({
            'modelId': 'dt_0',
            'tweets': df_tweets.to_json(orient='records')
        })


class RunClustering(APIView):

    def get(self, request, format=None):
        selected_features = ['valence', 'arousal', 'dominance', 'moral1', 'moral2', 'moral3']
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
            'grp': lambda x: math.ceil((x.loc[x == 'lib'].shape[0] / x.shape[0]) * 100) / 100
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
        features = request_json['features']

        df_tweets = pd.DataFrame(tweets)

        lb = preprocessing.LabelBinarizer()
        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        model = load_model(model_id)
        pdp_values, _ = partial_dependence(model, X, [1], percentiles=(0, 1))   # 0 is the selected feature index
        # plot_partial_dependence(model, X, [0])
        print('pdp values: ', pdp_values)

        df_tweets['pdpValues'] = pdp_values[0]

        # performance

        return Response({
            'modelId': 'dt_1',
            'tweets': df_tweets.to_json(orient='records'),
            'pdpValues': pdp_values[0]
        })


class RunClusteringAndPartialDependenceForClusters(APIView):

    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        model_id = request_json['modelId']
        features = request_json['features']
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
            'group': lambda x: math.ceil((x.loc[x == 'lib'].shape[0] / x.shape[0]) * 100) / 100
        }).rename(columns={'group': 'group_lib_ratio'})

        # Calculate partial dependence
        lb = preprocessing.LabelBinarizer()
        X = df_tweets[features]
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)

        model = load_model(model_id)
        pdp_values, _ = partial_dependence(model, X, [1], percentiles=(0, 1))   # 0 is the selected feature index
        # plot_partial_dependence(model, X, [0])
        print('pdp values: ', pdp_values)

        # Results
        cluster_ids = cls_labels
        pdp_values = pdp_values[0]

        df_clusters = pd.DataFrame({
            'clusterId': list(df_tweets_by_cluster.groups),
            'numTweets': num_tweets_per_group,
            'groupRatio': df_group_ratio['group_lib_ratio'],
            'pdpValue': 0.2
            # 'tweetIds': tweet_ids_per_cluster_list
        })

        print('run clustering: ', df_clusters.to_json(orient='records'))

        return Response({
            'clusters': df_clusters.to_json(orient='records'),
            'clusterIdsForTweets': cluster_ids,
            'pdpValues': pdp_values
        })
