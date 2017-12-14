import json
def import_json(path):
    with open(path, 'r') as load_f:
        load_dict = json.load(load_f)
    return load_dict['seg_detail']

def export_json(path,json_str):
    with open(path,'w') as dump_f:
        json.dump(json.loads(json.dumps(json_str)),dump_f)
    print('export '+path+' success!')
    return True