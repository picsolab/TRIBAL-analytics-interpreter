from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
from rest_framework import status
from . import models

import pandas as pd
import numpy as np
import json, math
from sklearn.tree import DecisionTreeRegressor
from sklearn.cluster import AgglomerativeClustering
from sklearn.model_selection import train_test_split
from sklearn import preprocessing

### For the initial run
class LoadData(APIView):
    def get(self, request, format=None):
        tweet_objects = models.Tweet.objects.all()
        tweet_objects_json = eval(serializers.serialize('json', tweet_objects)) # serializer return string, so convert it to list with eval()
        tweets_json = [ tweet['fields'] for tweet in tweet_objects_json ]

        return Response(tweets_json)

### For the global interpretability,
class RunDecisionTree(APIView):
    def get(self, request, format=None):
        pass
    
    def post(self, request, format=None):
        request_json = json.loads(request.body.decode(encoding='UTF-8'))
        tweets = request_json['tweets']
        selected_featuers = request_json['selectedFeatures']
        df_tweets = pd.DataFrame(tweets)
        
        lb = preprocessing.LabelBinarizer()

        X = df_tweets[selected_featuers]
        y = lb.fit_transform(df_tweets['group'].astype(str))
        y = np.ravel(y)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state=0)
        clf = DecisionTreeRegressor(max_depth=15, random_state=1)
        clf.fit(X_train, y_train)
        
        y_pred_binary = clf.predict(X)
        y_pred_string = lb.inverse_transform(y_pred_binary)
        df_tweets['pred'] = y_pred_string

        # performance

        return Response(df_tweets.to_json(orient='records'))

class RunClustering(APIView):
    def get(self, request, format=None):
        print('hello')

        selected_features = ['valence', 'arousal', 'dominance']
        tweet_objects = models.Tweet.objects.all()
        tweet_objects_json = eval(serializers.serialize('json', tweet_objects)) # serializer return string, so convert it to list with eval()
        tweets_json = [ tweet['fields'] for tweet in tweet_objects_json ]

        df_tweets = pd.DataFrame(tweets_json)
        print('df_tweets: ', df_tweets.head())
        df_tweets_selected = df_tweets[selected_features]
        fit_cls = AgglomerativeClustering(n_clusters=10).fit(df_tweets_selected)
        cls_labels = fit_cls.labels_
        print(cls_labels)
        df_tweets['cluster'] = cls_labels
        
        df_tweets_by_cluster = df_tweets.groupby(['cluster'])
        num_tweets_per_group = df_tweets_by_cluster.size()
        print('size: ', df_tweets_by_cluster.size())
        print('here: ', df_tweets_by_cluster.describe())


        df_group_ratio = df_tweets_by_cluster.agg({ 
            'grp': lambda x: math.ceil((x.loc[x == 'lib'].shape[0] / x.shape[0]) * 100) / 100
        }).rename(columns={'grp': 'group_lib_ratio'})

        print('group_ratio: ', df_group_ratio)

        df_clusters = pd.DataFrame({
            'clusterId': list(df_tweets_by_cluster.groups),
            'numTweets': num_tweets_per_group,
            'groupRatio': df_group_ratio['group_lib_ratio'],
            'pdpValue': 0.2
        })

        print('df_clusters: ', df_clusters.head())

        return Response(df_clusters.to_json(orient='records'))
