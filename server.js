const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

let partidas = {};

// Crear partida con nombre, host y límite de jugadores
app.post('/crear-partida', (req, res) => {
    const { nombreSala, hostName, maxJugadores } = req.body;
    const salaId = 'sala_' + Date.now();
    
    let max = parseInt(maxJugadores) || 4;
    if (max < 1) max = 1;
    if (max > 10) max = 10;

    partidas[salaId] = {
        id: salaId,
        nombreSala: nombreSala || 'Sala de juego',
        hostName: hostName || 'Anfitrión',
        maxJugadores: max,
        jugadores: {},
        chat: [],
        ultimoLatido: Date.now()
    };
    
    res.json({ status: 'ok', salaId: salaId });
});

// Listar salas activas y verificar límite o inactividad
app.get('/buscar-partidas', (req, res) => {
    const ahora = Date.now();
    
    Object.keys(partidas).forEach(salaId => {
        if (ahora - partidas[salaId].ultimoLatido > 7000) {
            delete partidas[salaId];
        }
    });

    const lista = Object.values(partidas).map(p => ({
        id: p.id,
        nombreSala: p.nombreSala,
        hostName: p.hostName,
        totalJugadores: Object.keys(p.jugadores).length,
        maxJugadores: p.maxJugadores
    }));
    res.json({ partidas: lista });
});

// Sincronizar posición, chat y estado de la sala
app.post('/mover-jugador', (req, res) => {
    const { salaId, playerId, name, x, y, mensajeChat } = req.body;

    if (!partidas[salaId]) {
        return.json({ jugadores: {}, chat: [], error: "Sala cerrada" });
    }

    const sala = partidas[salaId];
    sala.ultimoLatido = Date.now();

    // Validar si el jugador es nuevo y la sala está llena
    const esNuevo = !sala.jugadores[playerId];
    const totalActual = Object.keys(sala.jugadores).length;

    if (esNuevo && totalActual >= sala.maxJugadores) {
        return res.json({ lleno: true });
    }

    // Registrar o actualizar jugador
    sala.jugadores[playerId] = {
        id: playerId,
        name: name || 'Jugador',
        x: x,
        y: y,
        lastUpdate: Date.now()
    };

    // Agregar mensaje al chat si existe
    if (mensajeChat && mensajeChat.trim() !== '') {
        sala.chat.push({
            sender: name,
            text: mensajeChat.trim(),
            time: Date.now()
        });
        if (sala.chat.length > 30) sala.chat.shift(); // Mantener últimos 30 mensajes
    }

    // Limpiar desconectados
    const ahora = Date.now();
    Object.keys(sala.jugadores).forEach(id => {
        if (ahora - sala.jugadores[id].lastUpdate > 6000) {
            delete sala.jugadores[id];
        }
    });

    res.json({ jugadores: sala.jugadores, chat: sala.chat });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
