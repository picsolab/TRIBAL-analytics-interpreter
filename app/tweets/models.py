from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _


@python_2_unicode_compatible
class Tweet(models.Model):
    # """ Tweet Model """
    tweet_id = models.BigIntegerField(primary_key=True, default='')
    grp = models.CharField(max_length=100, null=False, default='NaN')
    content = models.TextField(max_length=200, null=False, default='NaN')
    screen_name = models.CharField(max_length=100, null=False, default='NaN')
    valence = models.FloatField(null=False, default=0.0)
    valence_seq = models.TextField(max_length=200, null=False, default='NaN')
    valence_seq_rank = models.BigIntegerField(null=False, default=0)
    valence_pred = models.FloatField(null=False, default=0.0)
    valence_grp_pred = models.BigIntegerField(null=False, default=0)
    dominance = models.FloatField(null=False, default=0.0)
    dominance_seq = models.TextField(max_length=200, null=False, default='NaN')
    dominance_seq_rank = models.BigIntegerField(null=False, default=0)
    dominance_pred = models.FloatField(null=False, default=0.0)
    dominance_grp_pred = models.BigIntegerField(null=False, default=0)
    harm = models.BigIntegerField(null=False, default=0)
    harm_seq = models.TextField(max_length=200, null=False, default='NaN')
    harm_seq_rank = models.BigIntegerField(null=False, default=0)
    harm_pred = models.BigIntegerField(null=False, default=0)
    harm_grp_pred = models.BigIntegerField(null=False, default=0)
    harm_prob = models.FloatField(null=False, default=0.0)
    fairness = models.BigIntegerField(null=False, default=0)
    fairness_seq = models.TextField(max_length=200, null=False, default='NaN')
    fairness_seq_rank = models.BigIntegerField(null=False, default=0)
    fairness_pred = models.BigIntegerField(null=False, default=0)
    fairness_grp_pred = models.BigIntegerField(null=False, default=0)
    fairness_prob = models.FloatField(null=False, default=0.0)

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
