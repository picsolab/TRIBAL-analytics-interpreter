TRIBAL Analytic Interpreter
======

The **Analytic Interpreter** for *TRIBAL project* is a visual analytic toolkit for the analysis on group biases, that incorporates (a) a suite of visual analytic components to help quantitatively and qualitatively inspect the shared and varied characteristics of groups, and (b) interpretable machine learning algorithms, including multi-task predictive models and contrastive explanatory models, to identify qualitative evidence and rationale for individuals regarded as group members.

#### Specification

- <b>React</b>: Frontend framework for rendering and communicating with data
- <b>django</b>: Python-based backend framework for serving API of data and running machine learning work
- <b>styled-component</b>: The stylesheet grammar for more flexible structure
- <b>d3.js</b>: Javascript-based visualization library


### Overview

<h1 align="center">
	<img width="700" src="https://www.dropbox.com/s/b1ct9gzqjsdkrjh/system-overview.png?raw=1" alt="TRIBAL">
	<br>
	<br>
</h1>


### Tasks
Our system supports the following specific tasks to achieve 

- **Group Trend (T1)**: in our design, the characteristics of groups will be visualized as group trend and the differences between groups will be contrasted through visual encoding.
- **Inference reliance (T2)**: the tool supports users to assess the analytic model quality against ground-truth data whenever available. 
- **Group variance (T3)**: the tool will extract and visualize subgroup characteristics to support the examination of the within-group trends and variation.
- **Attribute importance (T4)**: how groups are differentiable by the key characteristics or attributes will be visualized as attribute importance -- the dependence of a given attribute when predicting a group.
- **Qualitative details (T5)**: the tool will enable users to retrieve the qualitative cues from individual data instances that are representative for each quantitative measured attribute.
- **Grouping rationale (T6)**: in our design, the group rationale will be offered through a contrastive explanation -- to explain why a member is considered to belong to one group rather than the other.


### System
The system overview of Analytic Interpreter. The system integrates visualization and analytic pipeline to support the group analysis tasks:
- (a) **Instance Viewer**: Supports navigation and retrieval of instances of interest 
- (b) **Scope Controller**: Enables data retrieval, selection, and control. The visualization of selected attributes with adjusted scopes are rendered in the main visualization panel
- (c) **Group Trend**: Visually captures the major trends of groups across attributes
- (d) **LanguageScope**: Provides a visual summary of the language evidence for every sociolinguistic attribute, enabling users to further retrieve qualitative details from the tweet instances. 

The analytic pipeline includes: 
- (g) **Multi-task prediction models** for generating language cues from the tweet dataset to support the visual inspection in LanguageScope
- (f) **Contrastive explanatory models** for discovering rationales for explaining the prediction of any instance.


### Reference
