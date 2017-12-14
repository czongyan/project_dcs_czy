from project_dcs_czy.dcs_czy_view.view_map import *
from project_dcs_czy.dcs_czy_data.kmeans import *
file_in = 'E:/eclipse/workspace/DCS/WebContent/data/a2.csv'
raw_data = readCSV_Head(file_in)
# water,date_range=get_allRawData(interval)
# data=water[('2016-02-20 01:50:00' <=water['date']) & (water['date'] <= '2016-02-20 02:30:00')]
# print(data.loc[:,['date','MW','MWD2']])
# water['date']=water['date'].astype('str')
dataSet=raw_data.loc[:,['HHA11']]
raw_data['k']=0
for dx in range(0,len(raw_data['HHA11'])):
    if(raw_data['HHA11'][dx]>=83):
        raw_data['k'][dx]=85
    if(raw_data['HHA11'][dx]<83):
        raw_data['k'][dx] = 80
exportCSV_DF(raw_data,'E:/eclipse/workspace/DCS/WebContent/data/a3.csv')
print(raw_data)

# dataSet=dataSet.as_matrix(columns=None)
# ## step 2: clustering...
# print("step 2: clustering...")
# dataSet = mat(dataSet)
# k = 2
# centroids, clusterAssment = kmeans(dataSet, k)
# print(clusterAssment) #图心
# print("step 3: show the result...")
# showCluster(dataSet, k, centroids, clusterAssment)