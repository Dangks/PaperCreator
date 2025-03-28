// 获取 DOM 元素
const paperSizeSelect = document.getElementById('paper-size');
const paperTypeSelect = document.getElementById('paper-type');
const lineSpacingInput = document.getElementById('line-spacing');
const lineThicknessInput = document.getElementById('line-thickness');
const lineColorInput = document.getElementById('line-color');
const lineStyleSelect = document.getElementById('line-style'); // 新增获取线条样式
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

// 默认线条间距
const defaultLineSpacing = 8;

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
        case 'practice': return '练字帖'; // 新增练字帖
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

// 设置线条样式的函数
function setLineStyle(ctx, lineStyle) {
    if (lineStyle === 'solid') {
        ctx.setLineDash([]); // 实线
    } else if (lineStyle === 'dashed') {
        ctx.setLineDash([10, 5]); // 虚线
    } else if (lineStyle === 'dotted') {
        ctx.setLineDash([2, 5]); // 点线
    }
}

// 绘制横线纸
function drawLined(ctx, config) {
    const { startX, startY, endX, contentHeight, lineSpacing } = config;
    const lines = Math.floor(contentHeight / lineSpacing);
    for (let i = 0; i <= lines; i++) {
        const y = startY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

// 绘制方格纸
function drawGrid(ctx, config) {
    const { startX, startY, endX, endY, lineSpacing } = config;

    // 计算完整的列数和行数
    const cols = Math.floor((endX - startX) / lineSpacing);
    const rows = Math.floor((endY - startY) / lineSpacing);

    // 绘制水平线
    for (let i = 0; i <= rows; i++) {
        const y = startY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + cols * lineSpacing, y); // 只绘制完整的格子
        ctx.stroke();
    }

    // 绘制垂直线
    for (let j = 0; j <= cols; j++) {
        const x = startX + j * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + rows * lineSpacing); // 只绘制完整的格子
        ctx.stroke();
    }
}

// 绘制点阵纸
function drawDot(ctx, config) {
    const { startX, startY, contentWidth, contentHeight, lineSpacing, lineThickness } = config;
    const cols = Math.floor(contentWidth / lineSpacing);
    const rows = Math.floor(contentHeight / lineSpacing);

    for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= cols; j++) {
            const x = startX + j * lineSpacing;
            const y = startY + i * lineSpacing;
            ctx.beginPath();
            ctx.arc(x, y, lineThickness * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 绘制米字格或练字帖
function drawMiOrPractice(ctx, config) {
    const { startX, startY, contentWidth, contentHeight, lineSpacing, lineThickness, lineStyle } = config;

    // 计算完整的列数和行数
    const cols = Math.floor(contentWidth / lineSpacing);
    const rows = Math.floor(contentHeight / lineSpacing);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = startX + j * lineSpacing;
            const y = startY + i * lineSpacing;
            const halfSpacing = lineSpacing / 2;

            // 绘制外框
            ctx.beginPath();
            ctx.lineWidth = lineThickness; // 外框线条宽度
            ctx.setLineDash(lineStyle === 'solid' ? [] : lineStyle === 'dashed' ? [10, 5] : [2, 5]); // 根据线条样式设置外框
            ctx.rect(x, y, lineSpacing, lineSpacing);
            ctx.stroke();

            // 绘制对角线
            ctx.beginPath();
            ctx.lineWidth = lineThickness / 4; // 对角线线条宽度
            ctx.moveTo(x, y);
            ctx.lineTo(x + lineSpacing, y + lineSpacing);
            ctx.moveTo(x + lineSpacing, y);
            ctx.lineTo(x, y + lineSpacing);
            ctx.stroke();

            // 绘制十字线
            ctx.beginPath();
            ctx.lineWidth = lineThickness / 4; // 十字线线条宽度
            ctx.moveTo(x + halfSpacing, y);
            ctx.lineTo(x + halfSpacing, y + lineSpacing);
            ctx.moveTo(x, y + halfSpacing);
            ctx.lineTo(x + lineSpacing, y + halfSpacing);
            ctx.stroke();
        }
    }

    // 绘制最外层大框线（始终为实线）
    ctx.beginPath();
    ctx.lineWidth = lineThickness; // 大框线条宽度
    ctx.setLineDash([]); // 始终为实线
    ctx.rect(startX, startY, cols * lineSpacing, rows * lineSpacing);
    ctx.stroke();
}

// 绘制纸张的主函数
function drawPaper() {
    const paperSize = paperSizeSelect.value;
    const paperType = paperTypeSelect.value;
    const lineSpacing = parseFloat(lineSpacingInput.value) * 3.78; // 转换为像素
    const lineThickness = parseFloat(lineThicknessInput.value);
    const lineColor = lineColorInput.value;
    const lineStyle = lineStyleSelect.value; // 获取线条样式
    const marginTop = parseFloat(marginTopInput.value) * 3.78;
    const marginBottom = parseFloat(marginBottomInput.value) * 3.78;
    const marginLeft = parseFloat(marginLeftInput.value) * 3.78;
    const marginRight = parseFloat(marginRightInput.value) * 3.78;

    // 设置 Canvas 尺寸
    const size = sizes[paperSize];
    const displayWidth = size.width * 3.78;
    const displayHeight = size.height * 3.78;
    const scaleFactor = 2;
    canvas.width = displayWidth * scaleFactor;
    canvas.height = displayHeight * scaleFactor;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置绘图样式
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = lineColor;
    ctx.lineWidth = lineThickness * scaleFactor;
    ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

    // 设置线条样式
    setLineStyle(ctx, lineStyle);

    // 计算绘图区域
    const startX = marginLeft;
    const startY = marginTop;
    const endX = displayWidth - marginRight;
    const endY = displayHeight - marginBottom;
    const contentWidth = endX - startX;
    const contentHeight = endY - startY;

    const config = { startX, startY, endX, endY, contentWidth, contentHeight, lineSpacing, lineThickness, lineStyle };

    // 根据纸张类型调用对应的绘制函数
    if (paperType === 'lined') {
        drawLined(ctx, config);
    } else if (paperType === 'grid') {
        drawGrid(ctx, config);
    } else if (paperType === 'dot') {
        drawDot(ctx, config);
    } else if (paperType === 'mi' || paperType === 'practice') {
        drawMiOrPractice(ctx, config);
    }
}

// 实时监听设置的更改
paperSizeSelect.addEventListener('change', drawPaper);
paperTypeSelect.addEventListener('change', () => {
    if (paperTypeSelect.value === 'practice') {
        lineSpacingInput.value = 15; // 当选择练字帖时，默认间距为 15mm
    } else {
        lineSpacingInput.value = defaultLineSpacing; // 切换回其他纸张类型时，恢复默认间距 8mm
    }
    drawPaper();
});
lineSpacingInput.addEventListener('input', drawPaper);
lineThicknessInput.addEventListener('input', drawPaper);
lineColorInput.addEventListener('input', drawPaper);
lineStyleSelect.addEventListener('input', drawPaper); // 新增监听线条样式的更改
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