import os
import pandas as pd
from project_dcs_czy.dcs_czy_control.data_processing import *
def get_dataBySeason(select_start,select_end):
    file_dir='E:/python/project_dcs_czy/static/data/raw/interval-'
    interval='1min'
    file_name='allRawData.csv'
    data=readCSV_Head(file_dir+interval+'/'+file_name)
    data['date'] = data['date'].astype('str')
    temp_data = DataFrame()
    if len(select_start)>0:
        for i in range(0,len(select_start)):
            temp_data=pd.concat([temp_data,data[(select_start[i] <= data['date']) & (data['date'] <= select_end[i])]])
    return temp_data


