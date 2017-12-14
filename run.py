from flask import *
from project_dcs_czy.dcs_czy_view.view_map import *
import pandas as pd
import numpy as np
import json
import time
import csv
from project_dcs_czy.dcs_czy_view.segment_util import *
from project_dcs_czy.dcs_czy_view.stat_coordinate import *
from project_dcs_czy.dcs_czy_view.auto_season import *
from project_dcs_czy.dcs_czy_data.deal_json import *

'''获取3月份所有的原始数据'''
raw_data,dateRange=get_autoSegmentData()
coord_data=[]
# dt=raw_data.loc[:,['date','MW']]
# dt=dt.set_index('date')
# 每隔3个数据进行一次加法，当前数据与前面紧邻的2个数据做加法，和作为新数据的值.
#如果前面的数据没有3个，此时为nan,rolling_mean, roll_std等都是相同的用法。
# temp = pd.rolling_mean(dt['MW'], 20,center=True)
# 每隔一定数据进行一次操作，例如:每隔10个数据进行一次func操作
# temp_data=dt['MW'].rolling(15,win_type='900').mean()
# segment_dataBySet(raw_data)
app=Flask(__name__)
# app=Flask(__name__,static_url_path='')
@app.route('/map')
def map_start():
    return render_template('web/map/timeMap2.html')

@app.route('/dateRange')
def map_dateRange():
    '''获取选择展示的热力图'''
    arr=[]
    for val in raw_data.columns:
        if(val=='date'):
            continue
        else:
            arr.append(val)
    return jsonify(dateRange,arr)
@app.route('/dataRaw')
def get_rawByMap():
    select_type=request.args.get('selectType')
    arr=['date']
    arr.append(select_type)
    f=request.args.get('property_1')
    s=request.args.get('property_2')
    interval=request.args.get('interval')
    stat_obj = request.args.get('stat_obj')
    #截取选取段的原始数据
    dt = cutAllDataStartToEnd_NoIndex(raw_data, arr, f, s)
    result_data=[]
    stat_data={}
    if interval=='1':
        dt['date'] = dt['date'].astype('str')
        stat_data={'min':np.min(dt[arr]).values[1],'max':np.max(dt[arr]).values[1],'mean':np.mean(dt[arr]).values[0]}
        result_data = dt.transpose().to_json()
    else:
        dt['date'] = dt['date'].astype(pd.datetime)
        dt=dt.set_index('date')
        rule_value=interval+'min'
        if (stat_obj=='')|(stat_obj=='mean'):
            result_data=dt.resample(rule=rule_value).mean()
        if(stat_obj=="std"):
            result_data = dt.resample(rule=rule_value).std()
        result_data=result_data.reset_index()
        result_data['date'] = result_data['date'].astype('str')
        stat_data={'min':np.min(result_data[arr]).values[1],'max':np.max(result_data[arr]).values[1],'mean':np.mean(result_data[arr]).values[0]}
        result_data = result_data.transpose().to_json()
    print(stat_data)
    return jsonify(result_data,stat_data)

@app.route('/line_raw')
def get_rawByLine():
    cutDate = request.args.get('date').split(',')
    startDate=cutDate[0]
    endDate=cutDate[1]
    flag_y=request.args.get("flag_y")
    flag_m=request.args.get("flag_m")
    print(cutDate,flag_m,flag_y)
    if (flag_y!="")&(flag_m!=""):
        raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/raw/interval-1min/rawData'+flag_y+'.'+flag_m+'.01.csv')
    # print(raw_data)
    #截取选取时间段内的原始数据
    # temp_data = raw_data[(startDate <=raw_data['date']) & (raw_data['date'] <= endDate)]
    raw_data = raw_data.set_index('date')
    temp_data = raw_data.loc[startDate:endDate]
    temp_data=temp_data.reset_index()
    temp_data['date'] = temp_data['date'].astype('str')
    parameters=[]
    for i in temp_data.columns:
        parameters.append(i)
    return jsonify(temp_data.transpose().to_json(),parameters)
@app.route('/coordinate_detail')
def get_detail_coordinate():
    # flag=request.args.get('flag')
    # if flag=="coordinate":
    cutDate = request.args.get('date').split(',')
    startDate = cutDate[0]
    endDate = cutDate[1]
    temp_data = raw_data[(startDate <= raw_data['date']) & (raw_data['date'] <= endDate)]
    values=[min(temp_data['MW']),max(temp_data['MW']),np.mean(temp_data['MW'])*0.03]
    temp_data['date'] = temp_data['date'].astype('str')
    exportCSV_DF(temp_data, 'E:/python/project_dcs_czy/static/data/stat/coordinate20160301.csv')
    parameters = []
    for i in temp_data.columns:
        parameters.append(i)
    return jsonify(values)

@app.route('/coordinate_stat')
def get_stat_coordinateData():
    cutDate = request.args.get('date').split(',')
    startDate=cutDate[0]
    endDate=cutDate[1]
    #平稳段std限制最大值
    stdSet=0.03
    temp_data = raw_data[(startDate <=raw_data['date']) & (raw_data['date'] <= endDate)]
    values=[min(temp_data['MW']),max(temp_data['MW']),np.mean(temp_data['MW'])*stdSet]
    #自动计算相似工况段
    data=auto_coordinateStat(raw_data,values)
    # #加载已有的时间段
    # data=auto_coordinateStat(raw_data,values)
    data['startDate']= data['startDate'].astype('str')
    data['endDate'] = data['endDate'].astype('str')
    exportCSV_DF(data,'E:/python/project_dcs_czy/static/data/stat/coordinate20160301.csv')
    parameters=[]
    for i in data.columns:
        parameters.append(i)
    coord_data=data
    print("统计结束")
    allDate=[min(raw_data['date'])._repr_base,max(raw_data['date'])._repr_base]
    print(allDate)
    return jsonify(values,allDate)

@app.route('/stat')
def stat_parallel():
    return render_template('web/stat/index.html')

@app.route('/stat_parallel')
def get_stat_parallelData():
    data=view_processing_data()
    parameters=[]
    for i in data.columns:
        parameters.append(i)
    # print(data)
    stat=data.transpose().to_json()
    print(data)
    return jsonify(stat,parameters)

@app.route('/coordinate')
def stat_coordinate():
    return render_template('web/stat/brushing.html')

@app.route('/coordinate_info')
def get_stat_coordinate_info():
    if len(coord_data)==0:
        data = readCSV_Head('E:/python/project_dcs_czy/static/data/stat/coordinate20160301.csv')
    else:
        data=coord_data
    print(coord_data)
    parameters=[]
    for i in data.columns:
        parameters.append(i)
    # stat_data=data.to_json(orient="values")//转化为数组对象
    data=data.transpose().to_json()
    print(coord_data)
    return jsonify(data,parameters)
@app.route('/name', methods=['POST'])
def sendjson():
# 接受前端发来的数据
    data = json.loads(request.form.get('data'))

# lesson: "Operation System"
# score: 100
    lesson = data["lesson"]
    score = data["score"]

# 自己在本地组装成Json格式,用到了flask的jsonify方法
    info = dict()
    info['name'] = "pengshuang"
    info['lesson'] = lesson
    info['score'] = score
    return jsonify(info)

@app.route('/scatter.html')
def scatter():
	return render_template('web/stat/scatter.html')
@app.route('/detail_scatter.html')
def detail_scatter():
	return render_template('web/stat/detail_scatter.html')
@app.route('/coordinate.html')
def coordinate():
	return render_template('web/stat/coordinate.html')

@app.route('/detail_coordinate.html')
def detail_coordinate():
	return render_template('web/stat/detail_coordinate.html')
'''未使用'''
@app.route('/goto_coordinate')
def goto_coordinate():
    cross_html = "http://127.0.0.1:5000/coordinate.html"
    return '<iframe width="0" height="0" style="display:none;" src='+cross_html+'></iframe>'
'''未使用结束'''
'''auto_mode开始'''
#根据参数组合自动分割出相似的工况
#根据条件获取一种相似工况
@app.route('/get_autoMode')
def get_autoMode():
    mwMin=int(request.args.get('min'))
    mwMax=int(request.args.get('max'))
    coalNum=int(request.args.get("coal"))
    water=convertWater(request.args.get("water"))
    flag_y=request.args.get("flag_y")
    flag_m=request.args.get("flag_m")
    if (flag_y!="")&(flag_m!=""):
        raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/raw/interval-1min/rawData'+flag_y+'.'+flag_m+'.01.csv')
    print(raw_data)
    values = [mwMin,mwMax, 0.03]
    condition_date = segment_dataBySet(raw_data.loc[:, ['date', 'MW', 'NOM', 'PAB10CT101']], 1, True, coalNum,water, values)
    data_flag=0
    if(condition_date==0):
        result_data = raw_multiSolution(raw_data)
    else:
        data_flag = 1
        result_data=raw_multiSolution(raw_data,condition_date)
    result_data['date'] = result_data['date'].astype('str')
    del_col=['PAB10CT103']
    raw_multi=result_data.drop(del_col,axis=1,inplace=False)
    auto_mode=raw_multi.transpose().to_json()
    return jsonify(auto_mode,data_flag)

#根据选择选取一种负荷下所有状态的相似工况
'''第一次分割处理（根据每个月）'''
@app.route('/get_allMode')
def get_allMode():
    mwMin=int(request.args.get('min'))
    mwMax=int(request.args.get('max'))
    coalNum=[]
    for i in  request.args.get("coal").split(','):
        coalNum.append(int(i))
    water=[]
    for i in request.args.get("water").split(','):
        water.append(int(i))
    args=get_allModeByLimit(mwMin,mwMax,coalNum,water)
    flag_y=request.args.get("flag_y")
    flag_m=request.args.get("flag_m")
    if (flag_y!="")&(flag_m!=""):
        raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/raw/interval-1min/rawData'+flag_y+'.'+flag_m+'.01.csv')
    path_dir='E:/python/project_dcs_czy/static/data/date/seg'+flag_y+'.'+flag_m+'_1.json'
    result_data,data_flag,mode_class=raw_allMultiModeByMW(raw_data, args,path_dir)
    result_data['date'] = result_data['date'].astype('str')
    del_col = ['PAB10CT102']
    raw_multi = result_data.drop(del_col, axis=1, inplace=False)
    exportCSV_DF(raw_multi,'E:/python/project_dcs_czy/static/data/seg/segData'+flag_y+'.'+flag_m+'.01.csv')
    print(data_flag,mode_class)
    json_detail=[]
    for val in mode_class[:]:
        json_detail.append({'flag':val[0],'min':val[1],'coal':val[2],'max':val[3],'water':val[4]})
    json_str={'seg_detail':json_detail}
    export_json('E:/python/project_dcs_czy/static/data/seg/mode_class'+flag_y+'.'+flag_m+'.json',json_str)
    auto_mode = raw_multi.transpose().to_json()
    return jsonify(auto_mode, data_flag,mode_class)
'''第二次分割处理（根据每个月）'''
@app.route('/get_argMode')
def get_argMode():
    arg=[]
    for i in request.args.get('args').split(','):
        arg.append(i)
    flag_y=request.args.get("flag_y")
    flag_m=request.args.get("flag_m")
    result = import_segmentDate('E:/python/project_dcs_czy/static/data/date/seg' + flag_y + '.' + flag_m + '_1.json')
    if (flag_y!="")&(flag_m!=""):
        raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/raw/interval-1min/rawData'+flag_y+'.'+flag_m+'.01.csv')
    rawData = raw_data[:]
    path_dir = 'E:/python/project_dcs_czy/static/data/date/seg' + flag_y + '.' + flag_m + '_2.json'
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
    print(result_date,'E:/python/project_dcs_czy/static/data/result/seg_'+flag_y+'.'+flag_m+'.csv')
    return jsonify(result_date)

'''第一次分割处理（根据季度）'''
@app.route('/get_allModeBySeason')
def get_allModeBySeason():
    water=request.args.get('seasonClass')
    mwMin = int(request.args.get('mwMin'))
    mwMax=int(request.args.get('mwMax'))
    nom=request.args.get('nom')
    args=get_allModeBySeasonLimit(mwMin,mwMax,int(nom),int(water))
    print(water)
    if (water!=""):
        raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/season/1min/rawData_'+water+'.csv')
    path_dir='E:/python/project_dcs_czy/static/data/date/season_'+water+'_'+nom+'_1.json'
    print(args)
    result_data,data_flag,mode_class=raw_allMultiModeBySeason(raw_data, args,path_dir)
    result_data['date'] = result_data['date'].astype('str')
    del_col = ['PAB10CT102']
    raw_multi = result_data.drop(del_col, axis=1, inplace=False)
    exportCSV_DF(raw_multi,'E:/python/project_dcs_czy/static/data/seg/segDataBySeason_'+water+'_'+nom+'.csv')
    print(data_flag,mode_class)
    json_detail=[]
    for val in mode_class[:]:
        json_detail.append({'flag':val[0],'min':val[1],'coal':val[2],'max':val[3],'water':val[4]})
    json_str={'seg_detail':json_detail}
    export_json('E:/python/project_dcs_czy/static/data/seg/modeBySeasonSet_'+water+'_'+nom+'.json',json_str)
    auto_mode = raw_multi.transpose().to_json()
    return jsonify(auto_mode, data_flag,mode_class)
'''第二次分割处理（根据季度）'''
@app.route('/get_argModeBySeason')
def get_argModeBySeason():
    arg=[]
    for i in request.args.get('args').split(','):
        arg.append(i)
    flag_y=request.args.get("flag_y")
    flag_m=request.args.get("flag_m")
    result = import_segmentDate('E:/python/project_dcs_czy/static/data/date/season' + flag_y + '.' + flag_m + '_1.json')
    if (flag_y!="")&(flag_m!=""):
        raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/raw/interval-1min/rawData'+flag_y+'.'+flag_m+'.01.csv')
    rawData = raw_data[:]
    path_dir = 'E:/python/project_dcs_czy/static/data/date/seg' + flag_y + '.' + flag_m + '_2.json'
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
    # print(result_date,'E:/python/project_dcs_czy/static/data/result/seg_'+flag_y+'.'+flag_m+'.csv')
    return jsonify(result_date)
'''auto_mode结束'''
'''主界面加载'''
@app.route('/sidebar')
def sidebar_run():
    return render_template('web/map/overview.html')
@app.route('/auto_org')
def timeMap_org_auto():
    return render_template('web/map/timeMap_auto.html',select_date='')
@app.route('/auto')
def timeMap_auto():
    flag_y=request.args.get('flag_y')
    flag_m = request.args.get('flag_m')
    if(len(flag_m)==1):
        flag_m="0"+flag_m
    select_date={'flag_y':flag_y,'flag_m':flag_m}
    return render_template('web/map/timeMap_auto.html',select_date=select_date)
'''不存在存储好的文件需要根据条件查找存储'''
@app.route('/auto_bySeasonCal')
def auto_bySeasonCoal():
    flag_y=request.args.get('flag_y').split(',')
    flag_m = request.args.get('flag_m').split(',')
    flag_class=request.args.get('flag_class')
    select_start=[]
    data=DataFrame()
    select_end=[]
    if(len(flag_y)>0):
        for y in flag_y :
            y+=' 00:00:00'
            select_start.append(y)
        for m in flag_m:
            m+=' 59:59:00'
            select_end.append(m)
        data=get_dataBySeason(select_start,select_end)
    exportCSV_DF(data,'E:/python/project_dcs_czy/static/data/season/1min/rawData_'+flag_class+'.csv')
    return render_template('web/map/lineMap.html',flag_class=flag_class)
'''已经存在文件直接跳转'''
@app.route('/auto_bySeason')
def auto_bySeason():
    flag_class=request.args.get('flag_class')
    print(flag_class)
    return render_template('web/map/lineMap.html',flag_class=flag_class)

@app.route('/sidebar_right')
def sidebar_right_run():
    return render_template('web/map/other.html')
@app.route('/')
def main_run():
    return render_template('web/main.html')
'''main结束'''
'''相似工况段--平行坐标加载'''
@app.route('/goto_Parallel')
def goto_Parallel():
    print('start')
    flag = request.args.get('flag')
    type = request.args.get('type')
    flag_y = request.args.get('flag_y')
    flag_m = request.args.get('flag_m')
    if (len(flag_m) == 1):
        flag_m = "0" + flag_m
    select_date = {'flag':flag,'type':type,'flag_y': flag_y, 'flag_m': flag_m}
    return render_template('web/stat/seg_brushing.html', select_date=select_date)

@app.route('/seg_stat')
def seg_stat():
    flag=int(request.args.get('flag'))
    type=request.args.get('type')
    flag_y=request.args.get('flag_y')
    flag_m=request.args.get('flag_m')
    if (flag_y!="")&(flag_m!=""):
        raw_data = readCSV_Head('E:/python/project_dcs_czy/static/data/raw/interval-1min/rawData'+flag_y+'.'+flag_m+'.01.csv')
    rawData = raw_data[:]
    seg_detail=import_json('E:/python/project_dcs_czy/static/data/date/seg'+flag_y+'.'+flag_m+'_'+type+'.json')
    seg_date=[]
    for val in seg_detail[:]:
        if val['flag']==flag:
            seg_date=val['segDate']
    #根据分割最终稳定工况时间起始地点记录，合并稳定工况段，取均值
    data=auto_coordinateStatByDate(rawData,seg_date)
    parameters = []
    for i in data.columns:
        parameters.append(i)
    exportCSV_DF(data,'E:/python/project_dcs_czy/static/data/result/seg_'+flag_y+'.'+flag_m+'.csv')
    data=data.transpose().to_json()
    return jsonify(data, parameters)
'''相似工况段模块结束'''
if __name__ == '__main__':
    app.debug = True
    app.run(host='127.0.0.1',port=9000)