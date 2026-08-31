# ⚔️ Alianza Vikinga — App de Musicalización

App web para musicalizar en vivo la lectura de **"La historia que despertó a la Alianza Vikinga"**.

## 🎵 Secciones musicales

| Sección | Música |
|---|---|
| 🌿 Mitológica | Ambient nórdico épico |
| ⚓ Histórica | Épica de exploración vikinga |
| 🐉 Dragones | How to Train Your Dragon — Test Drive |
| 👑 Entrada de Reyes | Fanfarria real orquestada |

## 🎚️ Controles

- **▶ Reproducir / ⏸ Pausar** — por sección
- **🔊 Máximo** — impacto total
- **🔉 Fondo** — para narrar encima (15%)
- **🔇 Silencio** — mute instantáneo
- **Slider** — control fino de volumen

## 🚀 Uso local

Abrir `index.html` con un servidor local (por CORS con los archivos de audio):

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .
```

Luego abrir: http://localhost:8080

## 📁 Estructura

```
app/
├── index.html
├── style.css
├── app.js
└── audio/
    ├── mitologica.mp3
    ├── historica.mp3
    ├── dragones.mp3
    └── reyes.mp3
```

---

*⚔️ Colegio de los Sagrados Corazones · 185 años · ¡Que despierte la Alianza Vikinga! ⚔️*
