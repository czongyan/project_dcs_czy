from project_dcs_czy.dcs_czy_data.data_import import *
# data_importMptO2('E:/Data/2016.04.01-2016.04.30(1min采样)/功率、负荷、主汽')
# data_importWater_path('E:/Data/2016年4月/WATER')
# data_importCoalMill('E:/Data/2016-3-1angle/磨煤机运行')
# data_importCycleWater('E:/Data/循环水温02-09')
# data_importCycleWater('E:/Data/2016.04.01-2016.04.30(1min采样)')
import os
'''
1.从最原始的多个.csv数据合并为按月的.csv并合并所有的参数
2.合并按月的多个。csv文件=》一个所有原始数据的csv文件
3.从均值重采样所有的原始数据
'''


'''重采样不同间隔原始数据(取均值)的执行文件'''
filePath='E:/Data/data'
'''导入按月的原始数据到处一个存储所有数据的csv文件'''
# import_rawData(filePath)
filePath='E:/Data/rawData/interval-1min'

# resample_rawData(filePath,'5min')
# resample_rawData(filePath,'10min')
# resample_rawData(filePath,'30min')
# resample_rawData(filePath,'60min')
resample_rawData(filePath,'1D')


'''测试合并风氧煤csv'''
# data_importCoalO2()