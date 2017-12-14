import json
path = 'E:/python/project_dcs_czy/static/data/stat/segmentDate.json'
with open(path, 'r') as load_f:
    load_dict = json.load(load_f)
for val in load_dict['seg_detail']:
    print(val['flag'],val['segDate'])
