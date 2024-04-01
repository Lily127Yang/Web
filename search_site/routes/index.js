const express = require('express');
const router = express.Router();
const mysql = require('../mysql.js');
const {response} = require("express");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/process_post', function (request, response, next) {
    console.log(request.body)
    let search = request.body.search;
    const fetchSql = "select id_fetches,url,source_name,title,author,publish_date,summary as summary_ " +
        "from fetches where title like '%" + search + "%' order by publish_date desc LIMIT 10";
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        response.render('main', {column: "title", search: search, content: result});
    });
});

router.get('/article', function (request, response, next) {
    let id = request.query.id;
    const fetchSql = "select * from fetches where id_fetches=" + id +";";
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        response.render('article', {content: result});
    });
});

router.get('/process_page', function (request, response) {
    console.log(request.query)
    let offset = parseInt(request.query.page) * 10 - 10;
    let search = request.query.search;
    let column = request.query.column;
    const fetchSql = "select id_fetches,url,source_name,title,author,publish_date,summary as summary_ " +
        "from fetches where " + column + " like '%" + search + "%' order by publish_date desc LIMIT 10 " + "offset " + offset;
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        response.render('main', {column: column, search: search, content: result});
    });
});

router.get('/switch', function (request, response) {
    let search = request.query.search;
    let column = request.query.column;
    // console.log(request.query)
    const fetchSql = "select id_fetches,url,source_name,title,author,publish_date,summary as summary_ " +
        "from fetches where " + column + " like '%" + search + "%' order by publish_date desc LIMIT 10";
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        response.render('main', {column: column, search: search, content: result});
    });
});

router.get('/sort', function (request, response) {
    let search = request.query.search;
    let column = request.query.column;
    let sorting = request.query.sorting.toString();
    let fetchSql;
    if(sorting==="asc")
    {
        fetchSql = "select id_fetches,url,source_name,title,author,publish_date,summary as summary_ " +
            "from fetches where " + column + " like '%" + search + "%' order by publish_date asc LIMIT 10";
    }else{
        fetchSql = "select id_fetches,url,source_name,title,author,publish_date,summary as summary_ " +
            "from fetches where " + column + " like '%" + search + "%' order by publish_date desc LIMIT 10";
    }
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        response.render('main', {column: column, search: search, content: result});
    });
});

router.get('/bar', function (request, response) {
    let search = request.query.search;
    let column = request.query.column;
    // console.log(request.query)
    const fetchSql = "select publish_date,count(*) as count from fetches " +
        "where " + column + " like '%" + search + "%' group by publish_date order by publish_date asc;";
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        var x = [];
        var y = [];
        for (let i = 0; i < result.length; i++) {
            let date = new Date(result[i]['publish_date']).toISOString()
            x.push(date.substring(0, 4) + date.substring(5, 7) + date.substring(8, 10));
            y.push(result[i]['count'])
        }
        // console.log(x)
        // console.log(y)
        response.render('chartsBar', {X: x, Y: y});
    });
});

router.get('/pie', function (request, response) {
    let search = request.query.search;
    let column = request.query.column;
    response.render('chartsPie', {search: search, column: column});
});

router.get('/get_data', function (request, response) {
    let search = request.query.search;
    let column = request.query.column;
    // console.log(request.query)
    const fetchSql = "select publish_date,count(*) as count from fetches " +
        "where " + column + " like '%" + search + "%' group by publish_date order by publish_date asc;";
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        var data = [];
        for (let i = 0; i < result.length; i++) {
            let date = new Date(result[i]['publish_date']).toISOString()
            let name = date.substring(0, 4) + date.substring(5, 7) + date.substring(8, 10)
            let value = result[i]['count']
            data.push({name: name, value: value})
        }
        // console.log(data[0].name)
        response.write(JSON.stringify(data));
        response.end();
    });
});

router.get('/linChart', function (request, response) {
    let search = request.query.search;
    let column = request.query.column;
    response.render('chartsLine', {search: search, column: column});
});



const Segment = require('segment').Segment;
const segment = new Segment();
segment.useDefault();

router.get('/wordCloud', function (request, response) {
    response.render('wordCloud');
});

router.get('/get_words_json', function (request, response) {
    const fetchSql = "select title,publish_date  from fetches order by publish_date desc LIMIT 1000";
    mysql.query_noparam(fetchSql, async function (err, result, fields) {
        // console.log(result)
        let Text = "";
        for (let i = 0; i < result.length; i++) {
            Text += result[i]['title'];
        }
        // 开始分词
        let words = segment.doSegment(Text, {stripPunctuation: true})
        // 统计词频
        let countResult = count(words)
        // console.log(countResult);
        response.write(JSON.stringify(countResult));
        response.end();
    });

    // response.render('wordCloud');
});

function count(words) {
    let map = new Map();
    let keys = [];
    for (let i = 0; i < words.length; i++) {
        let word = words[i]
        if (map.has(word['w'])) {  // 如果有该key值
            map.set(word['w'], map.get(word['w']) + 1);
        } else {
            map.set(word['w'], 1);   // 如果没有该key值
            keys.push(word['w']);
        }
    }
    // console.log(keys)
    let result = [];
    for (let i = 0; i < keys.length; i++) {
        result.push({name: keys[i], value: map.get(keys[i])});
    }
    return result;
}

module.exports = router;