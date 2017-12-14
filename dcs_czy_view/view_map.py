from project_dcs_czy.dcs_czy_control.data_raw import *
def get_RawData():
    raw_data=combine_allRawData()
    # exportCSV_DF(raw_data,'E:/Data/resultData/raw20160301.csv')
    data=del_stateCol(raw_data)
    # exportCSV_DF(data, 'E:/Data/resultData/rawNOState20160301.csv')
    len, dim = data.shape
    dateRange = [np.min(data['date']), np.max(data['date'])]
    return data,dateRange
def get_allRawData(interval):
    file_in='E:/Data/rawData/interval-'+interval+'/allRawData.csv'
    if interval.find('D')>0:
        raw_data = readCSV_Day(file_in)
    else:
        raw_data = readCSV_Head(file_in)
    # print(raw_data['date'])
    len, dim = raw_data.shape
    dateRange = [np.min(raw_data['date']), np.max(raw_data['date'])]
    return raw_data,dateRange
def get_autoSegmentData():
    file_in = 'E:/Data/rawData/interval-1min/rawData2016.03.01.csv'
    raw_data = readCSV_Head(file_in)
    len, dim = raw_data.shape
    dateRange = [np.min(raw_data['date']), np.max(raw_data['date'])]
    return raw_data, dateRange