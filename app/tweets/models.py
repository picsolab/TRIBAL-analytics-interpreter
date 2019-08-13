from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _


@python_2_unicode_compatible
class Tweet(models.Model):
    # """ Tweet Model """
    tweet_id = models.BigIntegerField(primary_key=True, default='')
    grp = models.CharField(max_length=100, null=True)
    content = models.TextField(max_length=200, null=True)
    screen_name = models.CharField(max_length=100, null=True)
    valence = models.FloatField(null=True)
    dominance = models.FloatField(null=True)
    harm = models.FloatField(null=True)
    fairness = models.FloatField(null=True)

@python_2_unicode_compatible
class User(models.Model):
    # """ User Model """
    screen_name = models.CharField(max_length=100, primary_key=True)
    num_followers = models.BigIntegerField(null=True)
    num_friends = models.BigIntegerField(null=True)
    num_tweets = models.BigIntegerField(null=True)
    num_retweeted = models.BigIntegerField(null=True)
    num_tweets_in_dataset = models.BigIntegerField(null=True)
    lib_ratio = models.FloatField(blank=True, null=True)
