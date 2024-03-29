# Generated by Django 2.2.2 on 2019-12-04 15:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tweets', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tweet',
            name='authority_seq_rank',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='tweet',
            name='dominance_seq_rank',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='tweet',
            name='fairness_seq_rank',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='tweet',
            name='loyalty_seq_rank',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='tweet',
            name='purity_seq_rank',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='tweet',
            name='valence_seq_rank',
            field=models.FloatField(default=0.0),
        ),
    ]
