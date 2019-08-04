from django.conf.urls import url
from . import views

urlpatterns = [
    url(
        regex=r'^loadData/$',
        view=views.LoadData.as_view(),
        name='load_data'
    ),
    url(
        regex=r'^runDecisionTree/$',
        view=views.RunDecisionTree.as_view(),
        name='run_dt'
    ),
    url(
        regex=r'^runClustering/$',
        view=views.RunClustering.as_view(),
        name='run_clustering'
    ),
    url(
        regex=r'^calculatePartialDependence/$',
        view=views.CalculatePartialDependence.as_view(),
        name='calculate_partial_dependence'
    ),
    url(
        regex=r'^runClusteringAndPartialDependenceForClusters/$',
        view=views.RunClusteringAndPartialDependenceForClusters.as_view(),
        name='run_clustering_and_partial_dependence_for_clusters'
    ),
];