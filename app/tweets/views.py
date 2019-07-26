from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
from rest_framework import status
from . import models

import pandas as pd
import numpy as np
import json
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split

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
        print('here')
        ranking_instance = json.loads(request.body.decode(encoding='UTF-8'))
        print(ranking_instance)
        # X = pd_dist_from_seq_to_frag.T
        # y = lb.fit_transform(seqs.df_patient_labels['survive'].astype(str))
        # y = np.ravel(y)
        
        # X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state=0)
        # clf = DecisionTreeRegressor(max_depth=15, random_state=1)
        # clf.fit(X_train, y_train)
        
        # y_pred = clf.predict(X_test)