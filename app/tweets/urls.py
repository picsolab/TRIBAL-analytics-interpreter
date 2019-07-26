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
];