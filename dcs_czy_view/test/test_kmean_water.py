from project_dcs_czy.dcs_czy_view.view_map import *
from project_dcs_czy.dcs_czy_data.kmeans import *
interval='1D'
water,date_range=get_allRawData(interval)
data=water.loc[:,['date','PAB10CT101']]
# water['date']=water['date'].astype('str')
dataSet=water.loc[:,['PAB10CT101']]
dataSet=dataSet.as_matrix(columns=None)
## step 2: clustering...
print("step 2: clustering...")
dataSet = mat(dataSet)
k = 3
centroids, clusterAssment = kmeans(dataSet, k)
data['k']=0
for i in range(0,len(data['PAB10CT101'])):
    markIndex = int(clusterAssment[i, 0])
    data['k'][i]=markIndex
exportCSV_DF(data,'E:/python/project_dcs_czy/static/data/raw/waterClasses.csv') #图心

print("step 3: show the result...")
showCluster(dataSet, k, centroids, clusterAssment)