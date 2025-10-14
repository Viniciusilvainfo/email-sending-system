import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import moment from 'moment';

const app = express();
const PORT = 3000;

const secret = process.env.segredo;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.get('/', async (req, res) => {
    const now = moment();

    const dados = {
        "id" : 123,
        "data": now.format('MMMM Do YYYY, h:mm:ss a')
    };

    const token = jwt.sign(dados, secret, { expiresIn: '1h' });

    res.render('token', {token})
});


app.get('/enviar-email', auth, async (req, res) => {

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.email,
              pass: process.env.pass,
            },
          });
          
        (async () => {
            await transporter.sendMail({
                from: process.env.email,
                to: process.env.email,
                subject: "Hello ✔",
                text: "Hello world?",
                html: "<b>Hello world?</b>",
            });
        })();

        res.json({"message" : "E-mail enviado com sucesso"});
    }catch(e) {
        res.json({"message" : "Erro ao enviar e-mail"});
    }
});

function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secret, (err, usuario) => {
        if (err) return res.sendStatus(403);
        req.usuario = usuario;
        next();
    });
}

app.use((req, res) => {
    res.status(404).send("NOT FOUND ROUTE");
})

app.listen(PORT, () => {
    console.log("ESCUTANDO NA PORTA 3000");
});
