var source_name = "网易新闻";
var source = "网易新闻";
var myEncoding = "utf-8";
var seedURL = 'https://news.163.com/';
var mysql = require('./mysql.js');//mysql在相同文件夹下的mysql.js
var schedule = require('node-schedule');//定时

var seedURL_format = "$('a')";
//一般在html的<head></head>里
var keywords_format = " $('meta[name=\"keywords\"]').eq(0).attr(\"content\")";
var desc_format = " $('meta[name=\"description\"]').eq(0).attr(\"content\")";
var title_format = "$('title').text()";
var date_format = " $('meta[property=\"article:published_time\"]').eq(0).attr(\"content\")";
var author_format = " $('meta[name=\"author\"]').eq(0).attr(\"content\")";
//一般在html的<body></body>里
var content_format = "$('div.post_body').text()";
var source_format = "";//网页源代码里面没有source
var url_reg = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
// var url_reg = /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/  ;

var url_reg = /\/(\d{2})\/(\d{4})\/(\d{2})\/([A-Z0-9]{16}).htm/;
var regExp = /((\d{4}|\d{2})(\-|\/|\.)\d{1,2}\3\d{1,2})|(\d{4}年\d{1,2}月\d{1,2}日)/

var fs = require('fs');
var myRequest = require('request')
var myCheerio = require('cheerio')
var myIconv = require('iconv-lite')
require('date-utils');

//防止网站屏蔽我们的爬虫
var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}

//request模块异步fetch url
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        //proxy: 'http://x.x.x.x:8080',
        headers: headers,
        timeout: 10000 //
    }
    // console.log("run where")
    myRequest(options, callback)
}

//！定时执行
//var rule = new schedule.RecurrenceRule();
//var times = [0,2,4,6,8,10,12,14,16,18,20,22]; //每2小时自动执行
//var times2 = 34; //定义在第几分钟执行
//rule.hour = times;
//rule.minute = times2;

//定时执行httpGet()函数
//schedule.scheduleJob(rule, function() {
 //   seedget();
//});

//function seedget() {
request(seedURL, function(err, res, body) { //读取种子页面
    // try {
    //用iconv转换编码
    var html = myIconv.decode(body, myEncoding);
    // console.log(html);
    //准备用cheerio解析html
    var $ = myCheerio.load(html, { decodeEntities: true });
    // } catch (e) { console.log('读种子页面并转码出错：' + e) };

    var seedurl_news;

    try {
        seedurl_news = eval(seedURL_format);
        // console.log(seedurl_news);
    } catch (e) { console.log('url列表所处的html块识别出错：' + e) };
    // console.log("是这里出错了吗")
    seedurl_news.each(function(i, e) { //遍历种子页面里所有的a链接
        var myURL = "";
        try {
            //得到具体新闻url
            var href = "";
            href = $(e).attr("href");
            // console.log("href = ",href)
            if (typeof(href) == "undefined") {  // 有些网页地址undefined
                return true;
            }
            if (href.toLowerCase().indexOf('http://') >= 0 || href.toLowerCase().indexOf('https://') >= 0) myURL = href; //http://开头的或者https://开头
            else if (href.startsWith('//')) myURL = 'http:' + href; ////开头的
            else myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href; //其他

        } catch (e) { console.log('识别种子页面中的新闻链接出错：' + e) }
        // console.log("所以是检验格式这里出错没打印吗")
        // console.log(myURL)

        if (!url_reg.test(myURL))
        {
            console.log("REG格式检验不通过")
            return; //检验是否符合新闻url的正则表达式
        }
        else{
            console.log(myURL);
            newsGet(myURL); //读取新闻页面
        }
    });
});
//}

function newsGet(myURL) { //读取新闻页面
    request(myURL, function(err, res, body) { //读取新闻页面
        //try {
        // var html_news = myIconv.decode(body, myEncoding); //用iconv转换编码
        //console.log(html_news);
        //准备用cheerio解析html_news
        try {
            var html_news = myIconv.decode(new Buffer(body), 'utf-8'); //用iconv转换编码
            //准备用cheerio解析html_news
        } catch (e) { 
            console.log('转码出错：' + e);
            // var html_news = myIconv.decode(new Buffer(body), 'utf-8'); 
            return;
        };
        var $ = myCheerio.load(html_news, { decodeEntities: true });
        myhtml = html_news;
        //} catch (e) {    console.log('读新闻页面并转码出错：' + e);};

        console.log("转码读取成功:" + myURL);
        //动态执行format字符串，构建json对象准备写入文件或数据库
        var fetch = {};
        fetch.title = "";
        fetch.content = "";
        fetch.publish_date = (new Date()).toFormat("YYYY-MM-DD");
        //fetch.html = myhtml;
        fetch.url = myURL;
        fetch.source_name = source_name;
        fetch.source = source;
        fetch.source_encoding = myEncoding; //编码
        fetch.crawltime = new Date();

        if (keywords_format == "") fetch.keywords = source_name; // eval(keywords_format);  //没有关键词就用sourcename
        else fetch.keywords = eval(keywords_format);

        if (title_format == "") fetch.title = ""
        else fetch.title = eval(title_format); //标题

        fetch.summary = fetch.title;

        if (date_format != "") fetch.publish_date = eval(date_format); //刊登日期   
        console.log('date: ' + fetch.publish_date);
        console.log(myURL);
        if(regExp.exec(fetch.publish_date)==null){
            console.log("null ERR");
            return;
        }
        else
        {
            fetch.publish_date = regExp.exec(fetch.publish_date)[0];
            fetch.publish_date = fetch.publish_date.replace('年', '-')
        fetch.publish_date = fetch.publish_date.replace('月', '-')
        fetch.publish_date = fetch.publish_date.replace('日', '')
        fetch.publish_date = new Date(fetch.publish_date).toFormat("YYYY-MM-DD");
        }
        
        
        if (author_format == "") fetch.author = source_name; //eval(author_format);  //作者
        else fetch.author = eval(author_format);
        console.log("content_format",content_format)
        // if (content_format == "") fetch.content = "";
        if (content_format == "") return ;// 空的就不要了
        else fetch.content = eval(content_format).replace("\r\n" + fetch.author, ""); //内容,是否要去掉作者信息自行决定
        if (fetch.content=="") return;
        // if (source_format == "") fetch.source = fetch.source_name;
        // else fetch.source = eval(source_format).replace("\r\n", ""); //来源

        if (desc_format == "") fetch.desc = fetch.title;
        else if (eval(desc_format)==null){
            console.log('null ERR')
        }
        else{
            fetch.desc = eval(desc_format).replace("\r\n", ""); //摘要    
        }
  
        

        // var filename = source_name + "_" + (new Date()).toFormat("YYYY-MM-DD") +
        //     "_" + myURL.substr(myURL.lastIndexOf('/') + 1) + ".json";
        // ////存储json
        // fs.writeFileSync(filename, JSON.stringify(fetch));
        var fetchAddSql = 'INSERT INTO fetches(url,source_name,source_encoding,title,' +
        'keywords,author,source,publish_date,crawltime,summary,content) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
    var fetchAddSql_Params = [fetch.url, fetch.source_name, fetch.source_encoding,
    fetch.title, fetch.keywords, fetch.author, fetch.source,fetch.publish_date,
    fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.summary,fetch.content
    ];

        //执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
        mysql.query(fetchAddSql, fetchAddSql_Params, function(qerr, vals, fields) {
            if (qerr) {
                console.log(qerr);
            }
            else{
                console.log("写入mysql数据库成功！")
            }
        }); //mysql写入
    });

    
}