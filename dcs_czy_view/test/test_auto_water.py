# from project_dcs_czy.dcs_czy_view.auto_season import *
# a=['2015-11-26','2016-02-14']
# b=['2016-02-10','2016-04-08']
# data=get_dataBySeason(a,b)
# num, dim = data.shape
# print(num,dim)


from project_dcs_czy.dcs_czy_view.segment_util import *;
from project_dcs_czy.dcs_czy_data.deal_json import *;
'''参数分割稳定工况段（按季度）'''
def get_argModeBySeason():
    arg = ['MW', 'MSP', 'RRHRTEMPT', 'YRHRPRS']
    result = import_segmentDate('E:/python/project_dcs_czy/static/data/date/season_0_5.json')
    raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/season/1min/rawData_0.csv')
    rawData = raw_data[:]
    path_dir = 'E:/python/project_dcs_czy/static/data/date/season_0_5_2.json'
    # arg = ['MW', 'THRTEMP', 'MSP', 'YRHRTEMP', 'RRHRTEMP']
    result_date = []
    temp_str=[]
    for row in result:
        temp_arr = []
        temp_data = []
        for val in row[1]:
            print('开始', val)
            data = rawData.loc[(rawData['date'] >= val[0]) & (rawData['date'] <= val[1]), (['date'] + arg)]
            seg_std = np.std(data)
            # print(np.std(data))
            temp_date= judeSmoothByArg_detail_version_2(data, arg)
            if (len(temp_date) > 0):
                for val in temp_date[:]:
                    print('result',val[0],val[1])
                    temp_arr.append({'start':val[0],'end':val[1]})
                temp_data=temp_data+temp_date[:]
        if(temp_data):
            temp_str.append({'flag':row[0],'segDate':temp_arr})
            result_date.append([str(row[0]),temp_data])
    json_str={'seg_detail':temp_str}
    print('seg',json_str)
    export_json(path_dir,json_str)
    print(result_date,'E:/python/project_dcs_czy/static/data/result/season_0_5.csv')
get_argModeBySeason()