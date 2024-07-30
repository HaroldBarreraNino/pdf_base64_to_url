const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para manejar grandes solicitudes JSON
app.use(express.json({ limit: '50mb' }));

// Ruta para recibir el PDF en base64
app.post('/upload', (req, res) => {
    const { base64 } = req.body;
    if (!base64) {
        return res.status(400).send('Base64 string is required');
    }

    // Convertir la cadena base64 en un buffer
    const buffer = Buffer.from(base64, 'base64');
    const filename = `pdf-${Date.now()}.pdf`; // Nombre único para el archivo
    const filePath = path.join(__dirname, 'public', filename); // Ruta completa al archivo

    // Escribir el buffer en un archivo
    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            return res.status(500).send('Error saving file');
        }
        // Devolver la URL pública del archivo
        res.json({ url: `${req.protocol}://${req.get('host')}/public/${filename}` });
    });
});

// Servir archivos estáticos desde la carpeta 'public'
app.use('/public', express.static(path.join(__dirname, 'public')));

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Función para eliminar archivos en la carpeta 'public' cada 30 minutos
setInterval(() => {
    const publicDir = path.join(__dirname, 'public');
    fs.readdir(publicDir, (err, files) => {
        if (err) {
            console.error('Error reading directory', err);
            return;
        }
        files.forEach(file => {
            const filePath = path.join(publicDir, file);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file', err);
                } else {
                    console.log(`Deleted file: ${file}`);
                }
            });
        });
    });
}, 30 * 60 * 1000); // 30 minutos en milisegundos