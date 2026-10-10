const express = require('express');
const cors = require('cors');

const app = express();

// Configuración amplia de CORS para Android y navegadores
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Almacén temporal de salas en memoria
let partidas = [];

// Ruta de prueba para verificar que el servidor está despierto
app.get('/', (req, res) => {
    res.send('Servidor de Juego RPG activo');
});

// Registrar una nueva sala
app.post('/crear-partida', (req, res) => {
    const { nombreSala, ipJugador } = req.body;
    
    // Evitar duplicados con el mismo nombre
    partidas = partidas.filter(p => p.nombreSala !== nombreSala);
    
    const nuevaPartida = {
        id: Date.now().toString(),
        nombreSala: nombreSala || 'Sala Sin Nombre',
        ipJugador: ipJugador || 'Jugador 1',
        creadoEn: new Date()
    };
    
    partidas.push(nuevaPartida);
    res.json({ status: 'ok', partida: nuevaPartida });
});

// Consultar salas disponibles
app.get('/buscar-partidas', (req, res) => {
    res.json({ partidas });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
