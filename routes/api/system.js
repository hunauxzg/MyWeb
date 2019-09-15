const express = require('express');
const router = express.Router();

/**
 * 登录接口，跳转到登录界面
 */
router.get('/login', (req, res) => {
    res.redirect('/login.html');
});

/**
 * 数据查询接口示例
 */
router.get('/test', (req, res) => {
    res.json(
        {
            code: 0,
            msg: 'success',
            data: [
                {
                    id: 1,
                    name: 'tom',
                    score: 95
                },
                {
                    id: 2,
                    name: 'jack',
                    score: 88
                }
            ]
        }
    )
});

module.exports = router;
