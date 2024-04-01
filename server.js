const express = require('express')
const app = express()
const fs = require('fs')
const PORT = process.env.PORT || 8081
const USERS_FILE = './users.json'

app.get('/:id', (req, res) => {
    // 首先读取已经存在的用户
    fs.readFile(__dirname + '/' + USERS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error reading file')
            return
        }

        data = JSON.parse(data)
        const user = data['user' + req.params.id]

        if (!user) {
            res.status(404).send('User not found')
            return
        }
        console.log(user)
        
        res.send(JSON.stringify(user, null, 2))
    })
})


app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`)
})

