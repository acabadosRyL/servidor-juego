const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Guardaremos las salas o partidas creadas
let partidas = [];

// El cliente 1 llama aquí para CREAR el servidor / sala
app.post('/crear-partida', (req, res) => {
    const { nombreSala, ipJugador } = req.body;
    const nuevaPartida = { id: Date.now(), nombreSala, ipJugador };
    partidas.push(nuevaPartida);
    res.json({ status: "ok", mensaje: "Partida creada", partida: nuevaPartida });
});

// El cliente 2 llama aquí para ENCONTRAR el servidor / sala
app.get('/buscar-partidas', (req, res) => {
    res.json({ status: "ok", partidas });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});