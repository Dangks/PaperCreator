// 获取 DOM 元素
const paperSizeSelect = document.getElementById('paper-size');
const paperTypeSelect = document.getElementById('paper-type');
const lineSpacingInput = document.getElementById('line-spacing');
const lineThicknessInput = document.getElementById('line-thickness');
const lineColorInput = document.getElementById('line-color');
const marginTopInput = document.getElementById('margin-top');
const marginBottomInput = document.getElementById('margin-bottom');
const marginLeftInput = document.getElementById('margin-left');
const marginRightInput = document.getElementById('margin-right');
const canvas = document.getElementById('paper-canvas');
const ctx = canvas.getContext('2d');

// 纸张尺寸映射
const sizes = {
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 },
    Letter: { width: 216, height: 279 }
};

// 获取当前时间并格式化为字符串
function getFormattedTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
}

// 获取纸张类型的中文名称
function getPaperTypeName(type) {
    switch (type) {
        case 'lined': return '横线纸';
        case 'grid': return '方格纸';
        case 'dot': return '点阵纸';
        case 'mi': return '米字格';
        default: return '未知纸张';
    }
}

// 获取导出的文件名
function getExportFileName() {
    const paperType = getPaperTypeName(paperTypeSelect.value);
    const lineSpacing = lineSpacingInput.value;
    const lineThickness = lineThicknessInput.value;
    const paperSize = paperSizeSelect.value;
    const formattedTime = getFormattedTime();

    return `${paperType}-间距${lineSpacing}-线粗${lineThickness}-${paperSize}-${formattedTime}`;
}

// 绘制纸张的函数
function drawPaper() {
    const paperSize = paperSizeSelect.value;
    const paperType = paperTypeSelect.value;
    const lineSpacing = parseFloat(lineSpacingInput.value) * 3.78; // 转换为像素
    const lineThickness = parseFloat(lineThicknessInput.value);
    const lineColor = lineColorInput.value;
    const marginTop = parseFloat(marginTopInput.value) * 3.78; // 转换为像素
    const marginBottom = parseFloat(marginBottomInput.value) * 3.78;
    const marginLeft = parseFloat(marginLeftInput.value) * 3.78;
    const marginRight = parseFloat(marginRightInput.value) * 3.78;

    // 设置 Canvas 尺寸（逻辑尺寸）
    const size = sizes[paperSize];
    const displayWidth = size.width * 3.78; // 显示尺寸
    const displayHeight = size.height * 3.78;
    const scaleFactor = 2; // 分辨率倍数
    canvas.width = displayWidth * scaleFactor; // 实际像素尺寸
    canvas.height = displayHeight * scaleFactor;
    canvas.style.width = `${displayWidth}px`; // 显示尺寸
    canvas.style.height = `${displayHeight}px`;

    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置绘图样式
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness * scaleFactor; // 根据分辨率调整线条粗细
    ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0); // 设置缩放比例

    // 计算绘图区域（考虑页边距）
    const startX = marginLeft;
    const startY = marginTop;
    const endX = displayWidth - marginRight;
    const endY = displayHeight - marginBottom;
    const contentWidth = endX - startX;
    const contentHeight = endY - startY;

    // 根据纸张类型绘制
    if (paperType === 'lined') {
        // 绘制横线
        const lines = Math.floor(contentHeight / lineSpacing);
        const offsetY = (contentHeight - lines * lineSpacing) / 2;
        for (let i = 0; i <= lines; i++) {
            const y = startY + offsetY + i * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    } else if (paperType === 'grid') {
        // 绘制方格
        const cols = Math.floor(contentWidth / lineSpacing);
        const rows = Math.floor(contentHeight / lineSpacing);
        const offsetX = (contentWidth - cols * lineSpacing) / 2;
        const offsetY = (contentHeight - rows * lineSpacing) / 2;

        for (let i = 0; i <= rows; i++) {
            const y = startY + offsetY + i * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(startX + offsetX, y);
            ctx.lineTo(endX - offsetX, y);
            ctx.stroke();
        }
        for (let j = 0; j <= cols; j++) {
            const x = startX + offsetX + j * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(x, startY + offsetY);
            ctx.lineTo(x, endY - offsetY);
            ctx.stroke();
        }
    } else if (paperType === 'dot') {
        // 绘制点阵
        const cols = Math.floor(contentWidth / lineSpacing);
        const rows = Math.floor(contentHeight / lineSpacing);
        const offsetX = (contentWidth - cols * lineSpacing) / 2;
        const offsetY = (contentHeight - rows * lineSpacing) / 2;

        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j <= cols; j++) {
                const x = startX + offsetX + j * lineSpacing;
                const y = startY + offsetY + i * lineSpacing;
                ctx.beginPath();
                ctx.arc(x, y, lineThickness * 2, 0, Math.PI * 2);
                ctx.fillStyle = lineColor;
                ctx.fill();
            }
        }
    } else if (paperType === 'mi') {
        // 绘制米字格
        const cols = Math.floor(contentWidth / lineSpacing);
        const rows = Math.floor(contentHeight / lineSpacing);
        const offsetX = (contentWidth - cols * lineSpacing) / 2;
        const offsetY = (contentHeight - rows * lineSpacing) / 2;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = startX + offsetX + j * lineSpacing;
                const y = startY + offsetY + i * lineSpacing;
                const halfSpacing = lineSpacing / 2;

                // 绘制外框
                ctx.beginPath();
                ctx.lineWidth = lineThickness * scaleFactor; // 外框线条宽度
                ctx.rect(x, y, lineSpacing, lineSpacing);
                ctx.stroke();

                // 绘制对角线
                ctx.beginPath();
                ctx.lineWidth = (lineThickness * scaleFactor) / 4; // 米字线条宽度
                ctx.moveTo(x, y);
                ctx.lineTo(x + lineSpacing, y + lineSpacing);
                ctx.moveTo(x + lineSpacing, y);
                ctx.lineTo(x, y + lineSpacing);
                ctx.stroke();

                // 绘制十字线
                ctx.beginPath();
                ctx.moveTo(x + halfSpacing, y);
                ctx.lineTo(x + halfSpacing, y + lineSpacing);
                ctx.moveTo(x, y + halfSpacing);
                ctx.lineTo(x + lineSpacing, y + halfSpacing);
                ctx.stroke();
            }
        }
    }
}

// 实时监听设置的更改
paperSizeSelect.addEventListener('change', drawPaper);
paperTypeSelect.addEventListener('change', drawPaper);
lineSpacingInput.addEventListener('input', drawPaper);
lineThicknessInput.addEventListener('input', drawPaper);
lineColorInput.addEventListener('input', drawPaper);
marginTopInput.addEventListener('input', drawPaper);
marginBottomInput.addEventListener('input', drawPaper);
marginLeftInput.addEventListener('input', drawPaper);
marginRightInput.addEventListener('input', drawPaper);

// 默认绘制横线纸
drawPaper();

// 导出为 PNG
document.getElementById('export-png').addEventListener('click', () => {
    const fileName = getExportFileName() + '.png';
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 导出为 PDF
document.getElementById('export-pdf').addEventListener('click', () => {
    const fileName = getExportFileName() + '.pdf';
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf; // 从 window.jspdf 中获取 jsPDF 构造函数
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [canvas.width / 3.78, canvas.height / 3.78] // 将像素转换为毫米
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3.78, canvas.height / 3.78);
    pdf.save(fileName);
});