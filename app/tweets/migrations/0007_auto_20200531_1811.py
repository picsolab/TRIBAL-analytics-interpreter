# Generated by Django 2.2.2 on 2020-05-31 18:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tweets', '0006_auto_20200531_1806'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tweet',
            name='tweet_id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
    ]
