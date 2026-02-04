# Arbeitszeiterfassung Chatbot für Lehrkräfte

Ein intelligenter Chatbot, der Fragen zur Arbeitszeiterfassung von Lehrkräften beantwortet. Basiert auf Claude AI und einer lokalen Wissensdatenbank.

## Features

- 🤖 **KI-gestützte Antworten**: Nutzt Claude AI für natürliche Konversationen
- 📚 **Wissensdatenbank**: Antworten basieren auf lokalen Dokumenten
- 📧 **E-Mail-Weiterleitung**: Bei unbeantworteten Fragen kann eine E-Mail an die Ansprechperson gesendet werden
- 💬 **Modernes Chat-Interface**: Benutzerfreundliche Oberfläche mit TailwindCSS
- ☁️ **Netlify-Ready**: Kann direkt auf Netlify deployed werden

## Lokale Installation

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren:**
   ```bash
   cp .env.example .env
   ```
   
   Bearbeiten Sie die `.env` Datei:
   - `ANTHROPIC_API_KEY`: Ihr Claude API-Schlüssel von [Anthropic](https://console.anthropic.com/)
   - `EMAIL_*`: SMTP-Konfiguration für E-Mail-Versand

3. **Server starten:**
   ```bash
   npm start
   ```
   
   Oder im Entwicklungsmodus:
   ```bash
   npm run dev
   ```

4. **Browser öffnen:**
   Navigieren Sie zu `http://localhost:3000`

## Deployment auf Netlify

### Option 1: Netlify CLI (Empfohlen)

1. **Netlify CLI installieren:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Bei Netlify anmelden:**
   ```bash
   netlify login
   ```

3. **Deployment initialisieren:**
   ```bash
   netlify init
   ```

4. **Umgebungsvariablen setzen:**
   ```bash
   netlify env:set ANTHROPIC_API_KEY "your_api_key_here"
   netlify env:set EMAIL_HOST "smtp.gmail.com"
   netlify env:set EMAIL_PORT "587"
   netlify env:set EMAIL_USER "your_email@gmail.com"
   netlify env:set EMAIL_PASS "your_app_password"
   netlify env:set EMAIL_CONTACT "ansprechperson@schule.de"
   ```

5. **Deployen:**
   ```bash
   netlify deploy --prod
   ```

### Option 2: GitHub Integration

1. Pushen Sie den Code zu GitHub
2. Gehen Sie zu [Netlify](https://app.netlify.com/)
3. Klicken Sie auf "Add new site" → "Import an existing project"
4. Wählen Sie Ihr GitHub Repository
5. Setzen Sie die Umgebungsvariablen in den Site Settings
6. Deploy wird automatisch gestartet

## Wissensdatenbank erweitern

Fügen Sie neue Markdown- oder Textdateien zum Ordner `wissensdatenbank/` hinzu. Der Chatbot lädt automatisch alle `.md` und `.txt` Dateien.

### Vorhandene Dokumente:
- `arbeitszeit_grundlagen.md` - Grundlagen der Arbeitszeiterfassung
- `erfassung_methoden.md` - Methoden der Zeiterfassung
- `ueberstunden_mehrarbeit.md` - Überstunden und Mehrarbeit
- `teilzeit_elternzeit.md` - Teilzeit und Elternzeit
- `ferien_urlaub.md` - Ferien und Urlaub

## E-Mail-Konfiguration

Für Gmail:
1. Aktivieren Sie "Weniger sichere Apps" oder erstellen Sie ein App-Passwort
2. Tragen Sie die Daten in `.env` ein

## Projektstruktur

```
arbeitszeiterfassung-chatbot/
├── server.js              # Express Backend mit Claude API
├── package.json           # Abhängigkeiten
├── .env.example           # Beispiel-Konfiguration
├── public/
│   └── index.html         # Chat-Interface
└── wissensdatenbank/      # Dokumente für den Chatbot
    ├── arbeitszeit_grundlagen.md
    ├── erfassung_methoden.md
    ├── ueberstunden_mehrarbeit.md
    ├── teilzeit_elternzeit.md
    └── ferien_urlaub.md
```

## API-Endpunkte

- `POST /api/chat` - Chat-Nachricht senden
- `POST /api/send-email` - E-Mail an Ansprechperson senden
- `GET /api/health` - Health-Check

## Lizenz

MIT
