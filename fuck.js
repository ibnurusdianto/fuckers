const UI = {
    isVisible: false,
    isCopyEnabled: false,
    isPasteEnabled: false,
    isBothEnabled: false,
    language: 'indonesia',
    container: null,
    settings: {
        opacity: 0.9,
        position: 'right',
        theme: 'dark'
    },

    init() {
        this.createUI();
        this.setupKeyBindings();
        this.startClock();
        this.updateLanguage();
        this.applyTheme();
    },

    createUI() {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 20px;
            ${this.settings.position === 'right' ? 'right: 20px' : 'left: 20px'};
            background: ${this.settings.theme === 'dark' ? 'rgba(0, 0, 0, ' + this.settings.opacity + ')' : 'rgba(255, 255, 255, ' + this.settings.opacity + ')'};
            color: ${this.settings.theme === 'dark' ? 'white' : 'black'};
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            z-index: 999999;
            display: none;
            min-width: 250px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
        `;
        
        div.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div id="clock" style="font-size: 20px; font-weight: bold;"></div>
                <div id="date" style="font-size: 14px;"></div>
            </div>
            <div style="margin: 15px 0;">
                <select id="language" style="width: 100%; padding: 5px; margin: 5px 0;">
                    <option value="indonesia">Indonesia</option>
                    <option value="indramayu">Indramayu</option>
                </select>
                <select id="theme" style="width: 100%; padding: 5px; margin: 5px 0;">
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                </select>
                <select id="position" style="width: 100%; padding: 5px; margin: 5px 0;">
                    <option value="right">Kanan</option>
                    <option value="left">Kiri</option>
                </select>
                <input type="range" id="opacity" min="0.1" max="1" step="0.1" value="${this.settings.opacity}" style="width: 100%;">
            </div>
            <div style="margin: 15px 0;">
                <label class="toggle-switch">
                    <input type="checkbox" id="copyBypass">
                    <span class="slider"></span>
                    Bypass Copy
                </label>
                <label class="toggle-switch">
                    <input type="checkbox" id="pasteBypass">
                    <span class="slider"></span>
                    Bypass Paste
                </label>
                <label class="toggle-switch">
                    <input type="checkbox" id="bothBypass">
                    <span class="slider"></span>
                    Bypass Both
                </label>
            </div>
            <div id="status" style="font-size: 12px; color: #4CAF50; margin-top: 10px; text-align: center;"></div>
            <div id="instructions" style="font-size: 12px; margin-top: 10px;"></div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .toggle-switch {
                display: block;
                position: relative;
                padding-left: 50px;
                margin: 10px 0;
                cursor: pointer;
            }
            .toggle-switch input {
                display: none;
            }
            .slider {
                position: absolute;
                left: 0;
                top: 0;
                width: 40px;
                height: 20px;
                background-color: #ccc;
                border-radius: 20px;
                transition: 0.3s;
            }
            .slider:before {
                content: "";
                position: absolute;
                width: 16px;
                height: 16px;
                left: 2px;
                top: 2px;
                background: white;
                border-radius: 50%;
                transition: 0.3s;
            }
            input:checked + .slider {
                background: #4CAF50;
            }
            input:checked + .slider:before {
                transform: translateX(20px);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(div);
        this.container = div;
        this.setupEventListeners();
    },

    setupEventListeners() {
        const showStatus = (message) => {
            const status = document.getElementById('status');
            status.textContent = message;
            setTimeout(() => status.textContent = '', 2000);
        };

        document.getElementById('copyBypass').addEventListener('change', (e) => {
            this.isCopyEnabled = e.target.checked;
            if (this.isCopyEnabled) {
                this.enableCopy();
                showStatus('Copy Bypass Aktif');
            } else {
                this.disableCopy();
                showStatus('Copy Bypass Nonaktif');
            }
        });

        document.getElementById('pasteBypass').addEventListener('change', (e) => {
            this.isPasteEnabled = e.target.checked;
            if (this.isPasteEnabled) {
                this.enablePaste();
                showStatus('Paste Bypass Aktif');
            } else {
                this.disablePaste();
                showStatus('Paste Bypass Nonaktif');
            }
        });

        document.getElementById('bothBypass').addEventListener('change', (e) => {
            this.isBothEnabled = e.target.checked;
            if (this.isBothEnabled) {
                this.enableCopy();
                this.enablePaste();
                document.getElementById('copyBypass').checked = true;
                document.getElementById('pasteBypass').checked = true;
                showStatus('Copy & Paste Bypass Aktif');
            } else {
                this.disableCopy();
                this.disablePaste();
                document.getElementById('copyBypass').checked = false;
                document.getElementById('pasteBypass').checked = false;
                showStatus('Copy & Paste Bypass Nonaktif');
            }
        });

        document.getElementById('theme').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.applyTheme();
            showStatus(`Tema ${e.target.value} diterapkan`);
        });

        document.getElementById('position').addEventListener('change', (e) => {
            this.settings.position = e.target.value;
            this.container.style.left = e.target.value === 'left' ? '20px' : 'auto';
            this.container.style.right = e.target.value === 'right' ? '20px' : 'auto';
            showStatus(`Posisi diubah ke ${e.target.value}`);
        });

        document.getElementById('opacity').addEventListener('input', (e) => {
            this.settings.opacity = e.target.value;
            this.applyTheme();
        });

        document.getElementById('language').addEventListener('change', (e) => {
            this.language = e.target.value;
            this.updateLanguage();
            showStatus(`Bahasa diubah ke ${e.target.value}`);
        });
    },

    applyTheme() {
        const bgColor = this.settings.theme === 'dark' ? 
            `rgba(0, 0, 0, ${this.settings.opacity})` : 
            `rgba(255, 255, 255, ${this.settings.opacity})`;
        const textColor = this.settings.theme === 'dark' ? 'white' : 'black';
        
        this.container.style.background = bgColor;
        this.container.style.color = textColor;
    },

    updateLanguage() {
        const instructions = document.getElementById('instructions');
        if (this.language === 'indonesia') {
            instructions.innerHTML = `
                <b>Cara Penggunaan:</b><br>
                - Insert: Tampilkan/Sembunyikan Menu<br>
                - Home: Nonaktifkan Semua & Tutup<br>
                - Gunakan toggle untuk mengaktifkan/nonaktifkan bypass
            `;
        } else {
            instructions.innerHTML = `
                <b>Carane Nganggo:</b><br>
                - Insert: nggo nampilna menu karo ngumpeti menu<br>
                - Home: nggo mateni kabeh fungsi sing ana ning program lan bari mateni menu<br>
                - gunakena toggle ON/OFF kebutuhane sira copy atau paste atau kabehane (both)
            `;
        }
    },

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const clockEl = document.getElementById('clock');
            const dateEl = document.getElementById('date');
            
            clockEl.textContent = now.toLocaleTimeString('id-ID');
            dateEl.textContent = now.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    },

    setupKeyBindings() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Insert') {
                this.toggleUI();
            } else if (e.key === 'Home') {
                this.disableAll();
            }
        });
    },

    toggleUI() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
    },

    enableCopy() {
        document.addEventListener('copy', (e) => e.stopImmediatePropagation(), true);
    },

    enablePaste() {
        document.addEventListener('paste', (e) => e.stopImmediatePropagation(), true);
    },

    disableCopy() {
        document.removeEventListener('copy', (e) => e.stopImmediatePropagation(), true);
    },

    disablePaste() {
        document.removeEventListener('paste', (e) => e.stopImmediatePropagation(), true);
    },

    disableAll() {
        this.isCopyEnabled = false;
        this.isPasteEnabled = false;
        this.isBothEnabled = false;
        this.disableCopy();
        this.disablePaste();
        document.getElementById('copyBypass').checked = false;
        document.getElementById('pasteBypass').checked = false;
        document.getElementById('bothBypass').checked = false;
        this.isVisible = false;
        this.container.style.display = 'none';
    }
};

UI.init();
