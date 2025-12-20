document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-editor');
    const sidebar = document.getElementById('editor-sidebar');
    const accordion = document.getElementById('editor-accordion');
    const saveBtn = document.getElementById('save-content');

    // Define what's editable
    const config = [
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
            id: 'banner-rail',
            label: '圖片牆 (Banner Rail)',
            listSelector: '.banner-card',
            fields: [
                { label: '圖片網址', selector: 'img', attr: 'src' },
                { label: '標籤文字', selector: '.label' }
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

    // Initialize Editor UI
    function initEditor() {
        accordion.innerHTML = '';
        config.forEach(section => {
            const group = document.createElement('div');
            group.className = 'editor-group';
            group.innerHTML = `<h4 style="margin: 30px 0 15px; color: #000; font-size: 14px; border-left: 3px solid #000; padding-left: 10px;">${section.label}</h4>`;

            if (section.listSelector) {
                // List based editing
                const items = document.querySelectorAll(section.listSelector);
                items.forEach((item, index) => {
                    const itemBox = document.createElement('div');
                    itemBox.style.padding = '15px';
                    itemBox.style.background = '#f9f9f9';
                    itemBox.style.marginBottom = '10px';
                    itemBox.style.borderRadius = '4px';
                    itemBox.innerHTML = `<div style="font-size: 11px; color: #999; margin-bottom: 10px;">項目 #${index + 1}</div>`;

                    section.fields.forEach(field => {
                        const inputWrap = createFieldUI(field, item);
                        itemBox.appendChild(inputWrap);
                    });
                    group.appendChild(itemBox);
                });
            } else {
                // Static fields
                section.fields.forEach(field => {
                    const inputWrap = createFieldUI(field, document);
                    group.appendChild(inputWrap);
                });
            }

            accordion.appendChild(group);
        });
    }

    function createFieldUI(field, context) {
        const wrap = document.createElement('div');
        wrap.style.marginBottom = '12px';
        const label = document.createElement('label');
        label.textContent = field.label;

        const target = context.querySelector(field.selector);
        const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');

        if (target) {
            input.value = field.attr ? target.getAttribute(field.attr) : target.innerText;
        }

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            const el = context.querySelector(field.selector);
            if (el) {
                if (field.attr) {
                    el.setAttribute(field.attr, val);
                    // If it's a video source, we need to reload the video
                    if (el.tagName === 'SOURCE') {
                        const video = el.closest('video');
                        if (video) video.load();
                    }
                } else {
                    el.innerText = val;
                }
            }
        });

        wrap.appendChild(label);
        wrap.appendChild(input);
        return wrap;
    }

    // Toggle Toggle
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        document.body.classList.toggle('editing-active');

        // Refresh Lucide icons if any were added
        if (window.lucide) window.lucide.createIcons();
    });

    // Save functionality (Mock)
    saveBtn.addEventListener('click', () => {
        saveBtn.innerText = '儲存中...';
        setTimeout(() => {
            saveBtn.innerText = '已儲存！';
            setTimeout(() => { saveBtn.innerText = '儲存設定'; }, 2000);
            alert('內容已暫時儲存至瀏覽器（示範功能）');
        }, 800);
    });

    initEditor();
});
