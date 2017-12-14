'''一旦config.py在稍后被加载，这个配置变量可以通过app.config字典来获取，比如app.config["DEBUG"]。'''
DEBUG = True # 启动Flask的Debug模式
BCRYPT_LEVEL = 13 # 配置Flask-Bcrypt拓展
MAIL_FROM_EMAIL = "robert@example.com" # 设置邮件来源