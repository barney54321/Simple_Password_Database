// Bring in the express module
const express = require("express");
// Create an instance of express
const app = express();

// Bring in the mysql module
const mysql = require("mysql")

// Bring in path module
const path = require("path")

const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static('./public'))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/main.html"))
});

app.get("/delete", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/delete.html"))
})

app.get("/database", (req, res) => {
    //res.send("Accessing database");
    console.log("Request to view database");
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "password_database"
    })
    const queryString = "SELECT * FROM users"
    connection.query(queryString, (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err);
            res.sendStatus(500);
            return;
        }
        //res.json(rows);
        //var myjson = json(rows);
        res.write("<h1>People</h1><ol>");
        for (var i = 0; i < rows.length; i++) {
            res.write("<li>Username: "+rows[i].username+"<br>Password: "+rows[i].password+"</li>");
        }
        res.write("</ol>")
        res.write('<input type="button" onclick="window.location.href = \'/\';" value="Main Menu"/>')
        res.end();
    })
})

app.post("/result", (req, res) => {
    const username = req.body.create_username;
    const password = req.body.create_password;

    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "password_database"
    })
    const queryString = 'SELECT * FROM users WHERE username="'+username+'" AND password="'+password+'"'
    connection.query(queryString, (err, results, fields) => {
        if (err) {
            console.log("Failed to insert new user");
            console.log(err.errno);
            res.sendStatus(500);
            return
        } else if (results.length == 1) {
            console.log("Success")
            res.sendFile(path.join(__dirname + "/public/success.html"))
            return;
        } else {
            res.sendFile(path.join(__dirname + "/public/failure.html"))
        }
    })
})

app.post("/delete_finish", (req, res) => {
    const username = req.body.create_username;

    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "password_database"
    })
    const queryString = 'DELETE FROM users WHERE username="'+username+'"'
    connection.query(queryString, (err, results, fields) => {
        if (err) {
            console.log("Failed to insert new user");
            console.log(err.errno);
            res.sendStatus(500);
            return
        } 

        res.sendFile(path.join(__dirname + "/public/main.html"));
    })
})

app.post("/finish", (req, res) => {
    console.log("Trying to create a new user...");
    console.log("Username: " + req.body.create_username);
    const username = req.body.create_username;
    const password = req.body.create_password;

    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "password_database"
    })
    const queryString = "INSERT INTO users (username, password) VALUES (?, ?)"
    connection.query(queryString, [username, password], (err, results, fields) => {
        if (err) {
            console.log("Failed to insert new user");
            if (err.errno == 1062) {
                console.log("Repeat username");
                res.sendFile(path.join(__dirname + "/public/create2.html"));
                return;
            }
            console.log(err.errno);
            res.sendStatus(500);
            return
        } 

        console.log("Inserted a new user with id: ", results.insertId);
        res.sendFile(path.join(__dirname + "/public/main.html"));
    })
})

app.listen(3010, () => {
    console.log("Server currently running on port 3010");
})