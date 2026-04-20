# Text to Speech Converter

A clean, modern web application that converts written text into spoken words using the browser's Web Speech API. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **Real-time text input** with character counter (3000 character limit)
- **Multiple voice selection** – choose from all available system voices
- **Speech controls**: Play, Pause, Resume, Stop, and Clear
- **Adjustable speaking rate** – speed control from 0.5x to 2.0x
- **Responsive design** – works on desktop, tablet, and mobile devices
- **Live status updates** – shows current speech state

## Built With

<img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
<img src="https://img.shields.io/badge/Web_Speech_API-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Web Speech API" />
<img src="https://img.shields.io/badge/Font_Awesome-339AF0?style=flat-square&logo=fontawesome&logoColor=white" alt="Font Awesome" />


## Live Demo

Access the application directly in your browser – no installation required.

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, modern gradients)
- Vanilla JavaScript (ES6+)
- Web Speech API (`window.speechSynthesis`)
- Font Awesome Icons

## How to Use

1. **Type or paste** your text into the text area
2. **Select a voice** from the dropdown menu (if multiple voices are available)
3. **Adjust the speaking speed** using the slider (default: 1.0x)
4. **Click Speak** to hear the text
5. Use **Pause**, **Resume**, or **Stop** to control playback
6. **Clear** to remove text and reset

## Browser Compatibility

The Web Speech API is supported in:
- Chrome (desktop and Android)
- Edge
- Safari (macOS and iOS)
- Firefox (limited voice selection)
- Opera

> Note: Voice availability depends on your operating system and browser. For best results, use Chrome or Edge.

## Installation & Setup

No build tools or dependencies are required.

1. Download the `index.html` file
2. Open it in any modern web browser
3. Start using the application instantly

Alternatively, serve it locally using any static server:

```bash
npx serve .
# or
python -m http.server 8000