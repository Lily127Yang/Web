# 10215501435 杨茜雅
# 华东师范大学数据科学与工程学院Web编程暑期项目
# 为了节省时间可以直接查看文件夹中"全过程运行效果展示"录屏 也可以导入test文件夹中的test_data.txt文件到数据库中再直接运行
# test文件重test_data和crawler_code文件只是新闻爬虫数据中的一部分，用于个人测试，并不是爬下来的所有数据，所以只包含新浪和网易两个站点


## dependencies

```javascript
require('request');
require('cheerio');
require('iconv-lite');
require('mysql');
require('jschardet');
require('express');等
```

## 主要的代码文件
##爬虫代码和网页代码

```
|-- crawler/ # 新闻爬虫
	|--sina.js # 新浪新闻
    |--sjtu.js # 上海交通大学学术新闻网
    |--wangyi_ent.js # 网易娱乐
    |--wangyi_news.js # 网易新闻
    |--youth.js # 中国青年网
|-- search_site/  # 新闻展示网站
    |-- views/  # 主要的html代码
        |-- index.html  # 网站首页
        |-- main.html  # 在首页输入搜索内容之后跳转的网页
        |-- article.html  # 在main点击新闻内容后跳转的网页
        |-- wordCloud.html  # 词云图
        |-- chartsBar.html  # 直方图
        |-- chartsLine.html  # 折线图
        |-- chartsPie.html  # 饼图
|-- test/  # 测试用
    |-- crawler_code/  # 测试用 新浪新闻和网易新闻的爬虫代码
    |-- test_data/  # 测试用的数据集，可以直接导入数据库来查看网页效果
|-- README.md
|-- 全过程运行效果展示.mp4 
|-- 简要文字说明.pdf
```

## 运行项目准备工作

**新闻爬虫**

- 在 crawler/mysql.js 内更改数据库连接信息
- 运行 fetches.sql创建表
- 依次运行 
- node sina.js
- node sjtu.js
- node wangyi_ent.js
- node wangyi_news.js  
- node youth.js
```


**新闻展示网站**

- 在 search_site/mysql.js 内更改数据库连接信息，连接到刚爬到数据的数据库里
- 运行search_site/bin/www.js 在终端中打开
- node wwww.js
- 访问localhost:3000

