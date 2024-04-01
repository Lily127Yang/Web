const mysql = require("mysql");
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '你的密码',
    database: 'crawl1'
});
const query = function (sql, sqlparam, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, sqlparam, function (qerr, vals, fields) {
                conn.release(); //释放连接
                callback(qerr, vals, fields); //事件驱动回调
            });
        }
    });
};
const query_noparam = function (sql, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, function (qerr, vals, fields) {
                conn.release(); //释放连接
                callback(qerr, vals, fields); //事件驱动回调
            });
        }
    });
};
exports.query = query;
exports.query_noparam = query_noparam;