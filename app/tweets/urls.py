from django.conf.urls import url
from . import views

urlpatterns = [
    url(
        regex=r'^loadData/$',
        view=views.LoadData.as_view(),
        name='load_data'
    ),
    url(
        regex=r'^loadUsers/$',
        view=views.LoadUsers.as_view(),
        name='load_users'
    ),
    url(
        regex=r'^loadWords/$',
        view=views.LoadWords.as_view(),
        name='load_words'
    ),
    url(
        regex=r'^searchTweets/$',
        view=views.SearchTweets.as_view(),
        name='search_tweets'
    ),
    url(
        regex=r'^runDecisionTree/$',
        view=views.RunDecisionTree.as_view(),
        name='run_dt'
    ),
    # url(
    #     regex=r'^runClustering/$',
    #     view=views.RunClustering.as_view(),
    #     name='run_clustering'
    # ),
    url(
        regex=r'^calculatePartialDependence/$',
        view=views.CalculatePartialDependence.as_view(),
        name='calculate_partial_dependence'
    ),
    url(
        regex=r'^calculateTFIDFAndCooc/$',
        view=views.CalculateTFIDFAndCooc.as_view(),
        name='calculate_tfidf_and_cooc'
    ),
    url(
        regex=r'^runClusteringAndPartialDependenceForClusters/$',
        view=views.RunClusteringAndPartialDependenceForClusters.as_view(),
        name='run_clustering_and_partial_dependence_for_clusters'
    ),
    url(
        regex=r'^findContrastiveExamples/$',
        view=views.FindContrastiveExamples.as_view(),
        name='find_contrastive_examples'
    ),
    url(
        regex=r'^extractSeqs/$',
        view=views.ExtractSeqs.as_view(),
        name='extract_seqs'
    ),
]
