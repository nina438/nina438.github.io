document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'NINA_STUDIO_LIVE_CONTENT';
    const toggleBtn = document.getElementById('toggle-editor');
    const sidebar = document.getElementById('editor-sidebar');
    const accordion = document.getElementById('editor-accordion');
    const saveBtn = document.getElementById('save-content');

    // Block Templates for Dynamic Insertion
    const templates = {
        'image-text': `
            <section class="section img-text-block fade-in" data-editor-block="image-text">
                <div class="container grid grid-2">
                    <div class="text-content">
                        <h2 data-site="dynamic.title">新圖文區塊</h2>
                        <p data-site="dynamic.desc">在這裡輸入您的描述文字...</p>
                    </div>
                    <div class="image-content">
                        <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5" alt="New Image">
                    </div>
                </div>
            </section>
        `,
        'hero-simple': `
            <section class="section hero-simple fade-in" data-editor-block="hero-simple" style="padding: 100px 0; text-align: center; background: #f5f5f5;">
                <div class="container">
                    <h1 data-site="dynamic.hero_title" style="font-size: 60px;">簡約標題</h1>
                    <p data-site="dynamic.hero_desc">簡單的區塊描述文字，適合用來作為段落開頭。</p>
                </div>
            </section>
        `
    };

    // Add Wrapper UI for Preview
    const header = sidebar?.querySelector('.editor-header');
    if (header) {
        const controls = document.createElement('div');
        controls.className = 'editor-header-controls';
        controls.style.cssText = 'padding:10px; border-bottom:1px solid #eee; display:flex; gap:10px; justify-content:center;';
        controls.innerHTML = `
            <button class="device-btn active" data-device="desktop" title="電腦版">🖥️</button>
            <button class="device-btn" data-device="tablet" title="平板版">📱</button>
            <button class="device-btn" data-device="mobile" title="手機版">📱</button>
        `;
        header.after(controls);

        const deviceBtns = controls.querySelectorAll('.device-btn');
        deviceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                deviceBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const device = btn.dataset.device;
                document.body.classList.remove('preview-mobile', 'preview-tablet');
                if (device === 'mobile') document.body.classList.add('preview-mobile');
                if (device === 'tablet') document.body.classList.add('preview-tablet');
            });
        });
    }

    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-code';
    exportBtn.className = 'btn-save secondary';
    exportBtn.innerText = '同步代碼';
    exportBtn.style.cssText = 'margin-left:8px; background-color:#5f7c6b; font-size:12px; padding:6px 10px;';

    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset-content';
    resetBtn.className = 'btn-save secondary';
    resetBtn.innerText = '恢復檔案';
    resetBtn.style.cssText = 'margin-left:8px; background-color:#999; font-size:12px; padding:6px 10px;';

    if (saveBtn) {
        saveBtn.parentNode.appendChild(exportBtn);
        saveBtn.parentNode.appendChild(resetBtn);
    }

    // --- ENHANCED AUTO-SCANNER LOGIC ---

    function scanPageConfig() {
        const sections = [];

        // 1. Global Section (Sticky items like Brand/Footer/Nav)
        const globals = [];
        if (document.querySelector('[data-site="brand"]'))
            globals.push({ key: 'brand', label: '工作室 Logo 文字', selector: '[data-site="brand"]' });

        // Scan for nav items with [data-site]
        document.querySelectorAll('nav [data-site]').forEach(el => {
            const key = el.dataset.site;
            globals.push({ key: `${key}.text`, label: `導覽文字: ${el.innerText}`, selector: `[data-site="${key}"]` });
            if (el.tagName === 'A') {
                globals.push({ key: `${key}.link`, label: `↳ 跳轉連結`, selector: `[data-site="${key}"]`, attr: 'href' });
            }
        });

        if (document.querySelector('[data-site="footer"]'))
            globals.push({ key: 'footer', label: '頁腳版權文字', selector: '[data-site="footer"]' });

        if (globals.length) sections.push({ id: 'global', label: '✨ 全站導覽與設定', fields: globals });

        // 2. Page Sections ([data-editor-block])
        document.querySelectorAll('[data-editor-block]').forEach((sec, idx) => {
            const blockId = sec.dataset.editorBlock;
            const blockLabel = sec.id ? `區塊: #${sec.id}` : `區塊: ${blockId}`;
            const fields = [];

            // Find all components within this block using data-site
            sec.querySelectorAll('[data-site]').forEach(el => {
                const key = el.dataset.site;
                const shortLabel = key.split('.').pop().replace(/_/g, ' ');

                // Add text edit
                fields.push({ key: `${key}.text`, label: shortLabel, selector: `[data-site="${key}"]` });

                // If link, add href control
                if (el.tagName === 'A') {
                    fields.push({ key: `${key}.link`, label: `↳ 連結 (${shortLabel})`, selector: `[data-site="${key}"]`, attr: 'href' });
                }
            });

            // Find images
            sec.querySelectorAll('img').forEach((img, i) => {
                fields.push({
                    key: `${blockId}.img.${i}`,
                    label: `圖片 #${i + 1}`,
                    context: img,
                    attr: 'src'
                });
            });

            // Section style
            fields.push({
                key: `${blockId}.bg`,
                label: '背景顏色',
                context: sec,
                type: 'color',
                style: 'backgroundColor'
            });

            sections.push({ id: `sec-${idx}`, label: `📦 ${blockLabel}`, fields });
        });

        return sections;
    }

    function applySavedState() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;
        const data = JSON.parse(savedData);

        // Restore Dynamic Blocks
        if (data.blocks) {
            const main = document.querySelector('main');
            if (main) {
                main.querySelectorAll('[data-editor-block]').forEach(b => {
                    if (templates[b.dataset.editorBlock]) b.remove();
                });
                data.blocks.forEach(bData => {
                    const div = document.createElement('div');
                    div.innerHTML = templates[bData.type] || '';
                    const el = div.firstElementChild;
                    if (el) {
                        if (bData.styles) Object.keys(bData.styles).forEach(k => el.style[k] = bData.styles[k]);
                        main.appendChild(el);
                    }
                });
            }
        }

        // Apply styles/text/attributes
        Object.keys(data.static || {}).forEach(key => {
            const { val, attr, style, selector } = data.static[key];
            const els = document.querySelectorAll(selector);
            els.forEach(el => {
                if (style) el.style[style] = val;
                else if (attr) el.setAttribute(attr, val);
                else el.innerText = val;
            });
        });
    }

    function saveCurrentState() {
        const state = { static: {}, blocks: [] };

        document.querySelectorAll('[data-editor-block]').forEach(el => {
            if (templates[el.dataset.editorBlock]) {
                state.blocks.push({
                    type: el.dataset.editorBlock,
                    styles: { backgroundColor: el.style.backgroundColor }
                });
            }
        });

        const currentConfig = scanPageConfig();
        currentConfig.forEach(section => {
            section.fields.forEach(f => {
                const el = f.context || document.querySelector(f.selector);
                if (el) {
                    let val;
                    if (f.style) val = el.style[f.style];
                    else if (f.attr) val = el.getAttribute(f.attr);
                    else val = el.innerText;

                    state.static[f.key] = {
                        val,
                        attr: f.attr,
                        style: f.style,
                        selector: f.selector || null
                    };
                }
            });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function createFieldUI(field) {
        const wrap = document.createElement('div');
        wrap.className = 'editor-field-row';
        wrap.innerHTML = `<label style="text-transform: capitalize;">${field.label}</label>`;

        const inputGroup = document.createElement('div');
        inputGroup.className = 'editor-input-group';

        let input;
        const target = field.context || document.querySelector(field.selector);
        let currentVal = '';
        if (target) {
            if (field.style) currentVal = getComputedStyle(target)[field.style];
            else if (field.attr) currentVal = target.getAttribute(field.attr);
            else currentVal = target.innerText;
        }

        if (field.type === 'color') {
            const colorWrap = document.createElement('div');
            colorWrap.className = 'color-input-wrap';
            colorWrap.style.backgroundColor = currentVal;
            input = document.createElement('input');
            input.type = 'color';
            input.value = rgbToHex(currentVal) || '#ffffff';
            colorWrap.appendChild(input);
            inputGroup.appendChild(colorWrap);
            input.addEventListener('input', (e) => {
                colorWrap.style.backgroundColor = e.target.value;
                updateTarget(field, e.target.value);
            });
        } else {
            const isTextarea = currentVal.length > 50 || field.label.includes('desc') || field.label.includes('內文');
            input = isTextarea ? document.createElement('textarea') : document.createElement('input');
            input.value = currentVal;
            inputGroup.appendChild(input);
            input.addEventListener('input', (e) => updateTarget(field, e.target.value));
        }

        wrap.appendChild(inputGroup);
        return wrap;
    }

    function updateTarget(field, val) {
        const els = field.context ? [field.context] : document.querySelectorAll(field.selector);
        els.forEach(el => {
            if (field.style) el.style[field.style] = val;
            else if (field.attr) el.setAttribute(field.attr, val);
            else el.innerText = val;
        });
    }

    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return rgb;
        const parts = rgb.match(/\d+/g);
        if (!parts) return '#ffffff';
        const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
        return "#" + hex(parts[0]) + hex(parts[1]) + hex(parts[2]);
    }

    function initEditor() {
        if (!accordion) return;
        accordion.innerHTML = '';
        const currentConfig = scanPageConfig();

        currentConfig.forEach(section => {
            const group = document.createElement('div');
            group.className = 'editor-group';
            group.innerHTML = `<h4>${section.label}</h4>`;
            section.fields.forEach(f => group.appendChild(createFieldUI(f)));
            accordion.appendChild(group);
        });

        // Dynamic Block Management
        const blockGroup = document.createElement('div');
        blockGroup.className = 'editor-group';
        blockGroup.innerHTML = `<h4>➕ 區塊範本庫</h4>`;

        const menu = document.createElement('select');
        menu.style.cssText = 'width:100%; padding:8px; font-size:12px; margin-bottom:10px;';
        menu.innerHTML = `<option value="">選擇要插入的範本...</option>
                          <option value="image-text">圖文內容區塊</option>
                          <option value="hero-simple">簡約 Banner</option>`;

        menu.onchange = (e) => {
            const type = e.target.value;
            if (type && templates[type]) {
                const main = document.querySelector('main');
                const div = document.createElement('div');
                div.innerHTML = templates[type];
                main.appendChild(div.firstElementChild);
                e.target.value = '';
                initEditor();
            }
        };

        const list = document.createElement('div');
        document.querySelectorAll('[data-editor-block]').forEach((el, i) => {
            if (templates[el.dataset.editorBlock]) {
                const item = document.createElement('div');
                item.style.cssText = 'background:#f0f0f0; padding:6px 10px; border-radius:4px; font-size:11px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;';
                item.innerHTML = `<span>自定義區塊 #${i + 1}</span> <button style="color:#ff4444; background:none; border:none; cursor:pointer; font-weight:bold;">✕</button>`;
                item.querySelector('button').onclick = () => { el.remove(); initEditor(); };
                list.appendChild(item);
            }
        });

        blockGroup.appendChild(menu);
        blockGroup.appendChild(list);
        accordion.appendChild(blockGroup);
    }

    applySavedState();

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('editing-active');
            if (sidebar.classList.contains('active')) initEditor();
        });

        saveBtn.addEventListener('click', () => {
            saveCurrentState();
            saveBtn.innerText = '✅ 已儲存';
            setTimeout(() => { saveBtn.innerText = '儲存設定'; }, 2000);
        });

        exportBtn.addEventListener('click', () => {
            const data = localStorage.getItem(STORAGE_KEY);
            alert("同步代碼已複製到剪貼簿！請將其發送給 AI。");
            navigator.clipboard.writeText(data);
        });

        resetBtn.addEventListener('click', () => {
            if (confirm('確定恢復原始狀態？這將清除目前的暫存修改。')) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        });
    }
});
