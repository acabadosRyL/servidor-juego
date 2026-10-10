const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Guardar salas y jugadores en memoria
let partidas = {};

// Crear una nueva sala
app.post('/crear-partida', (req, res) => {
    const { nombreSala } = req.body;
    const salaId = nombreSala || 'Sala_' + Math.floor(Math.random() * 1000);
    
    if (!partidas[salaId]) {
        partidas[salaId] = {
            id: salaId,
            nombreSala: salaId,
            jugadores: {}
        };
    }
    
    res.json({ status: 'ok', salaId: salaId });
});

// Listar salas activas
app.get('/buscar-partidas', (req, res) => {
    const lista = Object.values(partidas).map(p => ({
        id: p.id,
        nombreSala: p.nombreSala,
        totalJugadores: Object.keys(p.jugadores).length
    }));
    res.json({ partidas: lista });
});

// Sincronizar posición del jugador y recibir la de los demás
app.post('/mover-jugador', (req, res) => {
    const { salaId, playerId, name, x, y, animFrame, direction } = req.body;

    if (!partidas[salaId]) {
        partidas[salaId] = { id: salaId, nombreSala: salaId, jugadores: {} };
    }

    // Actualizar datos del jugador actual
    partidas[salaId].jugadores[playerId] = {
        id: playerId,
        name: name,
        x: x,
        y: y,
        animFrame: animFrame,
        direction: direction,
        lastUpdate: Date.now()
    };

    // Limpiar jugadores desconectados (más de 10 segundos sin enviar datos)
    const ahora = Date.now();
    Object.keys(partidas[salaId].jugadores).forEach(id => {
        if (ahora - partidas[salaId].jugadores[id].lastUpdate > 10000) {
            delete partidas[salaId].jugadores[id];
        }
    });

    // Devolver todos los demás jugadores en la sala
    res.json({ jugadores: partidas[salaId].jugadores });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
