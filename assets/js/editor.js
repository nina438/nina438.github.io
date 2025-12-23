document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-editor');
    const sidebar = document.getElementById('editor-sidebar');
    const accordion = document.getElementById('editor-accordion');
    const saveBtn = document.getElementById('save-content');
    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-code';
    exportBtn.className = 'btn-save secondary';
    exportBtn.innerText = '產生同步代碼';
    exportBtn.style.cssText = 'margin-left:8px; background-color:#5f7c6b; font-size:12px; padding:6px 10px;';

    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset-content';
    resetBtn.className = 'btn-save secondary';
    resetBtn.innerText = '恢復檔案預設';
    resetBtn.style.cssText = 'margin-left:8px; background-color:#999; font-size:12px; padding:6px 10px;';

    // Add buttons
    if (saveBtn) {
        saveBtn.parentNode.appendChild(exportBtn);
        saveBtn.parentNode.appendChild(resetBtn);
    }

    resetBtn.addEventListener('click', () => {
        if (confirm('確定要捨棄暫存修改，恢復成原始檔案內容嗎？')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    // Safety check for UI elements
    const hasEditorUI = toggleBtn && sidebar && accordion && saveBtn;

    const STORAGE_KEY = 'NINA_STUDIO_LIVE_CONTENT';

    // Define what's editable
    const config = [
        {
            id: 'global',
            label: '全站通用設定 (Global)',
            fields: [
                { key: 'brand', label: '工作室名稱', type: 'text', selector: '[data-site="brand"]' },
                { key: 'footer', label: '頁腳文字', type: 'text', selector: '[data-site="footer"]' }
            ]
        },
        {
            id: 'hero',
            label: '首頁 Banner (Hero)',
            fields: [
                { key: 'hero.title', label: '大標題', type: 'text', selector: '[data-site="hero.title"]' },
                { key: 'hero.desc', label: '描述文字', type: 'textarea', selector: '[data-site="hero.desc"]' },
                { key: 'hero.image', label: '主圖網址', type: 'text', selector: '.hero-image img', attr: 'src' }
            ]
        },
        {
            id: 'courses',
            label: '課程清單',
            listSelector: '.course-card',
            fields: [
                { label: '課程名稱', selector: 'h3' },
                { label: '描述', selector: 'p' },
                { label: '圖片網址', selector: 'img', attr: 'src' }
            ]
        }
    ];

    // Apply saved changes from LocalStorage across pages
    function applySavedState() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        const data = JSON.parse(savedData);

        // Apply static fields (using data-site or direct selectors)
        Object.keys(data.static || {}).forEach(sel => {
            const value = data.static[sel].val;
            const attr = data.static[sel].attr;
            document.querySelectorAll(sel).forEach(el => {
                if (attr) el.setAttribute(attr, value);
                else el.innerText = value;
            });
        });

        // Apply list fields (like courses)
        if (data.lists) {
            Object.keys(data.lists).forEach(listSel => {
                const listItems = document.querySelectorAll(listSel);
                data.lists[listSel].forEach((itemData, idx) => {
                    const itemEl = listItems[idx];
                    if (itemEl) {
                        Object.keys(itemData).forEach(fieldSel => {
                            const { val, attr } = itemData[fieldSel];
                            const el = itemEl.querySelector(fieldSel);
                            if (el) {
                                if (attr) el.setAttribute(attr, val);
                                else el.innerText = val;
                            }
                        });
                    }
                });
            });
        }
    }

    // SCRAPE current DOM state and SAVE to LocalStorage
    function saveCurrentState() {
        const state = { static: {}, lists: {} };

        config.forEach(section => {
            if (section.listSelector) {
                state.lists[section.listSelector] = [];
                document.querySelectorAll(section.listSelector).forEach(item => {
                    const itemState = {};
                    section.fields.forEach(f => {
                        const el = item.querySelector(f.selector);
                        if (el) itemState[f.selector] = {
                            val: f.attr ? el.getAttribute(f.attr) : el.innerText,
                            attr: f.attr
                        };
                    });
                    state.lists[section.listSelector].push(itemState);
                });
            } else {
                section.fields.forEach(f => {
                    const el = document.querySelector(f.selector);
                    if (el) state.static[f.selector] = {
                        val: f.attr ? el.getAttribute(f.attr) : el.innerText,
                        attr: f.attr
                    };
                });
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // Initialize Editor UI
    function initEditor() {
        accordion.innerHTML = '';
        config.forEach(section => {
            const group = document.createElement('div');
            group.className = 'editor-group';
            group.innerHTML = `<h4 style="margin: 30px 0 15px; color: #000; font-size: 14px; border-left: 3px solid #000; padding-left: 10px;">${section.label}</h4>`;

            if (section.listSelector) {
                const items = document.querySelectorAll(section.listSelector);
                items.forEach((item, index) => {
                    const itemBox = document.createElement('div');
                    itemBox.style.padding = '15px'; itemBox.style.background = '#f9f9f9'; itemBox.style.marginBottom = '10px';
                    itemBox.innerHTML = `<div style="font-size: 11px; color: #999; margin-bottom: 10px;">項目 #${index + 1}</div>`;
                    section.fields.forEach(field => itemBox.appendChild(createFieldUI(field, item)));
                    group.appendChild(itemBox);
                });
            } else {
                section.fields.forEach(field => group.appendChild(createFieldUI(field, document)));
            }
            accordion.appendChild(group);
        });
    }

    function createFieldUI(field, context) {
        const wrap = document.createElement('div');
        wrap.style.marginBottom = '12px';
        const label = document.createElement('label'); label.textContent = field.label;
        const target = context.querySelector(field.selector);
        const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');

        if (target) {
            input.value = field.attr ? target.getAttribute(field.attr) : target.innerText;
        }

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            const el = context.querySelector(field.selector);
            if (el) {
                if (field.attr) el.setAttribute(field.attr, val);
                else el.innerText = val;
            }
        });

        wrap.appendChild(label); wrap.appendChild(input);
        return wrap;
    }

    // Apply saved state before building editor (Runs on all pages)
    applySavedState();

    if (hasEditorUI) {
        // Toggle functionality
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('editing-active');
        });

        // REAL SAVE
        saveBtn.addEventListener('click', () => {
            saveBtn.innerText = '儲存中...';
            saveCurrentState();
            setTimeout(() => {
                saveBtn.innerText = '已儲存！';
                setTimeout(() => { saveBtn.innerText = '儲存設定'; }, 2000);
            }, 500);
        });

        // EXPORT FOR AI SYNC
        exportBtn.addEventListener('click', () => {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const formatted = JSON.stringify(data, null, 2);

            // Create a persistent overlay to show code
            const overlay = document.createElement('div');
            overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center; padding:20px;';
            overlay.innerHTML = `
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:600px; width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.3);">
                    <h2 style="margin-top:0; color:#333;">同步至原始碼</h2>
                    <p style="color:#666; font-size:14px;">請複製下方代碼並貼回給 <b>Antigravity</b>，我將為您更新 site.json 與所有實體檔案。</p>
                    <textarea readonly style="width:100%; height:300px; padding:15px; font-family:monospace; border:1px solid #ddd; border-radius:6px; margin:15px 0; background:#f9f9f9; font-size:12px;">${formatted}</textarea>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding:10px 20px; border:none; background:#eee; cursor:pointer; border-radius:4px;">關閉</button>
                        <button id="copy-sync-btn" style="padding:10px 20px; border:none; background:#222; color:#fff; cursor:pointer; border-radius:4px;">複製代碼</button>
                    </div>
                </div>
           `;
            document.body.appendChild(overlay);

            document.getElementById('copy-sync-btn').onclick = () => {
                navigator.clipboard.writeText(formatted);
                document.getElementById('copy-sync-btn').innerText = '已複製！';
            };
        });

        initEditor();
    }
});

