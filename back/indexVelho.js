import bdConnection from "./shared/bdConnection.js";
import User from "./microsservicos/user.js";
import Reviews from "./microsservicos/reviews.js";
import eventBus from "./shared/eventBus.js";
import express, { json } from "express";
import cors from "cors"
import jwt from "jsonwebtoken";

const app = express();

app.use(cors())
app.use(express.json());

const JWT_SECRET = "super_secret_key"; 
const JWT_EXPIRATION = "2h";


async function startApp() {
    try {
        console.log("--- Sistema Iniciando ---");

        //criação do bd e tabela usuarios
        const db = new bdConnection();
        const pool = await db.init();

        const userModel = new User(pool);
        await userModel.initializeTable();

        //criação da tabela depoimentos
        const reviewsModel = new Reviews(pool);
        await reviewsModel.initializeTable();

        console.log("--- Sistema Pronto para Uso ---");

        userRoutes(userModel);
        reviewsRoutes(reviewsModel);
        
        app.listen(3000, () => console.log("🚀 Servidor rodando na porta 3000"));

    } catch (error) {
        console.error("Falha na inicialização:", error);
        process.exit(1); // Fecha o programa com erro
    }

}

function userRoutes(userModel) {
    //Middleware que verifica se o usuário possui o token
    const authenticate = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token de autenticaçao ausente." });
        }

        const token = authHeader.split(" ")[1];
        try {
            req.user = jwt.verify(token, JWT_SECRET);
            next();
        } catch (error) {
            return res.status(401).json({ error: "Token invalido ou expirado." });
        }
    };

    //rota de registro de usuário 
    app.post("/api/signup", async (req, res) => {
        try {
            const { nome, email, senha } = req.body

            const response = await userModel.createUser(nome, email, senha)

            if (!response[0]) {
                return res.status(409).json({ error: response[1].error});
            }

            const usuario = response[1]

            res.status(201).json({
                 id: usuario.id, 
                 nome: usuario.nome, 
                 email: usuario.email 
            });

        } catch (error) {
            console.error("POST /api/signup error:", error);
            res.status(500).json({ error: "Não foi possível criar a conta." });
        }
    });

    //rota de login
    app.post("/api/login", async (req, res) => {
        try {
            const { email, senha } = req.body;
            const normalizedEmail = email.trim().toLowerCase()

            const response = await userModel.findByEmail(normalizedEmail, senha)

            if (!response[0]) {
                return res.status(401).json({error: response[1].error})
            }

            const user = response[1]

            const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, JWT_SECRET, {
                  expiresIn: JWT_EXPIRATION,
            });

            res.status(201).json(
                {token, 
                    user: { 
                        id: user.id, 
                        nome: user.nome, 
                        email: user.email 
                    } 
                }
            );


        } catch (error) {
            console.error("POST /api/login error:", error);
            res.status(500).json({ error: "Não é possível fazer login com essa conta." });
        }
    });

    //rota de obtenção das informações do usuário já logado
    app.get("/api/me", authenticate, async (req, res) =>{
        try {
            const userId = req.user.id
            const response = await userModel.findById(userId)
            res.status(200).json({user: response})
        } catch (error) {
            console.error("GET /api/me error:", error);
            res.status(500).json({ error: "Não foi possível buscar o perfil." });
        }
    });
}

function reviewsRoutes(reviewsModel){
    app.post("/api/depoimentos", async (req, res) => {
        try {
            const {nomeCachorro, nomeTutor, raca, comentario} = req.body

            const response = await reviewsModel.createReview(nomeCachorro, nomeTutor, raca, comentario)

            if(!response[0]){
                return res.status(401).json({error: response[1]})
            }

            res.status(200).json(response[1])

        } catch (error) {
            console.error("POST /api/depoimentos error:", error)

            res.status(500).json({error: "Não foi possível publicar o depoimento."})
        }   
    })

    app.get("/api/depoimentos", async (req, res) =>{
        try {
            const response = await reviewsModel.getReview()
            res.status(200).json(response)
        } catch (error) {
            console.error("GET /api/depoimentos error:", error)
            res.status(500).json({ error: "Não foi possível encontrar o depoimento." })
        }
    })
}

startApp()