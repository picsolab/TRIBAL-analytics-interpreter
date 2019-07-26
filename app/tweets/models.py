from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _

@python_2_unicode_compatible
class Tweet(models.Model):
    pass
    # """ Tweet Model """

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('not-specified', 'Not specified')
    )

    # First Name and Last Name do not cover name patterns
    # around the globe.
    tweet_id = models.CharField(max_length=100, primary_key=True, default='')
    grp = models.CharField(max_length=100, null=True)
    content = models.TextField(max_length=200, null=True)
    screen_name = models.CharField(max_length=100, null=True)
    user_id = models.CharField(max_length=100, null=True)
    num_followers = models.BigIntegerField(null=True)
    num_friends = models.BigIntegerField(null=True)
    num_tweets = models.BigIntegerField(null=True)
    num_retweeted = models.BigIntegerField(null=True)
    bot_score = models.FloatField(blank=True, null=True)
    valence = models.FloatField(null=True)
    arousal = models.FloatField(null=True)
    dominance = models.FloatField(null=True)
    moral1 = models.FloatField(null=True)
    moral2 = models.FloatField(null=True)
    moral3 = models.FloatField(null=True)

    def __str__(self):
        return self.screen_name
