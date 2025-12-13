#!/bin/bash

# 進入專案目錄
cd "$(dirname "$0")"

# 備份原本的 index.html
if [ -f index.html ]; then
    echo "備份原本 index.html → index_backup.html"
    cp index.html index_backup.html
fi

# 下載模板 HTML & CSS
echo "下載模板 HTML 與 CSS..."
curl -s -o template.html https://raw.githubusercontent.com/nina438/simple-html-template/main/index.html
curl -s -o template.css https://raw.githubusercontent.com/nina438/simple-html-template/main/style.css

# 將模板 body 內容加入現有 index.html
echo "將模板內容套用到 index.html..."
sed -n '/<body>/,/<\/body>/p' template.html | sed '1d;$d' >> index.html

# 在 head 裡加入 template.css
sed -i '/<\/head>/i <link rel="stylesheet" href="template.css">' index.html

echo "模板已套用完成！"
echo "備份檔案：index_backup.html"
echo "請打開 VS Code 進行微調。"
