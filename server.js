const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@libsql/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.AUTH_TOKEN,
});

app.use(bodyParser.json());
app.use(cors());

app.post('/login', async (req, res) => {
    const { rollNumber, password } = req.body;
    console.log('Received roll number:', rollNumber);

    try {
        const query = `SELECT * FROM "Student-info" WHERE "rollNumber" = ?`;
        const params = [rollNumber];

        console.log('Executing query:', query);
        console.log('With parameters:', params);

        const result = await client.execute(query, params);

        console.log('Query result:', result);

        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'Student not found' });
        }

        const student = result.rows[0];

        if (password !== student["parentContact"]) {
            return res.status(401).send({ error: 'Incorrect password' });
        }

        const { password: _, ...studentData } = student;
        res.status(200).json(studentData);

    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/student/:rollNumber', async (req, res) => {
    const { rollNumber } = req.params;
    console.log('Received roll number:', rollNumber);

    try {
        const query = `SELECT * FROM "Student-info" WHERE "rollNumber" = ?`;
        const params = [rollNumber];

        console.log('Executing query:', query);
        console.log('With parameters:', params);

        const result = await client.execute(query, params);

        console.log('Query result:', result);

        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'Student not found' });
        }

        const student = result.rows[0];
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student details:', error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
