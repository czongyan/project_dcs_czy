from project_dcs_czy.dcs_czy_view.view_map import *
from project_dcs_czy.dcs_czy_data.kmeans import *
interval='60min'
water,date_range=get_allRawData(interval)
# data=water[('2016-02-20 01:50:00' <=water['date']) & (water['date'] <= '2016-02-20 02:30:00')]
# print(data.loc[:,['date','MW','MWD2']])
# water['date']=water['date'].astype('str')
dataSet=water.loc[:,['PAB10CT101']]
dataSet=dataSet.as_matrix(columns=None)
## step 2: clustering...
print("step 2: clustering...")
dataSet = mat(dataSet)
k = 3
centroids, clusterAssment = kmeans(dataSet, k)
print(clusterAssment) #图心
print("step 3: show the result...")
showCluster(dataSet, k, centroids, clusterAssment)