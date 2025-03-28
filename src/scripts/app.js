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

// 在 DOM 元素获取部分添加
const enableWatermarkInput = document.getElementById('enable-watermark');
const watermarkOptions = document.querySelector('.watermark-options');
const watermarkTextInput = document.getElementById('watermark-text');
const watermarkOpacityInput = document.getElementById('watermark-opacity');
const watermarkAngleInput = document.getElementById('watermark-angle');
const watermarkSizeInput = document.getElementById('watermark-size');
const watermarkColorInput = document.getElementById('watermark-color');
const opacityValue = document.getElementById('opacity-value');
const angleValue = document.getElementById('angle-value');

// 在获取 DOM 元素的部分添加
const marginsHeader = document.getElementById('margins-header');
const marginsContent = document.querySelector('.margins-content');
const toggleIcon = marginsHeader.querySelector('.toggle-icon');

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
        case 'practice': return '练字帖';
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
function setLineStyle(ctx, lineStyle, isOuterBorder = false) {
    // 如果是外框，始终使用实线
    if (isOuterBorder) {
        ctx.setLineDash([]);
        return;
    }
    
    // 根据样式设置线条
    switch (lineStyle) {
        case 'solid':
            ctx.setLineDash([]); // 实线
            break;
        case 'dashed':
            ctx.setLineDash([10, 5]); // 虚线
            break;
        case 'dotted':
            ctx.setLineDash([2, 5]); // 点线
            break;
    }
}

// 绘制横线纸
function drawLined(ctx, config) {
    const { startX, startY, endX, contentHeight, lineSpacing, lineStyle } = config;
    const lines = Math.floor(contentHeight / lineSpacing);
    
    setLineStyle(ctx, lineStyle); // 设置线条样式
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
    const { startX, startY, endX, endY, lineSpacing, lineStyle } = config;

    // 设置线条样式
    setLineStyle(ctx, lineStyle);

    // 计算完整的列数和行数（向下取整，确保只画完整格子）
    const cols = Math.floor((endX - startX) / lineSpacing);
    const rows = Math.floor((endY - startY) / lineSpacing);

    // 计算实际绘制区域（调整终点坐标，使其刚好容纳完整格子）
    const actualEndX = startX + cols * lineSpacing;
    const actualEndY = startY + rows * lineSpacing;

    // 绘制水平线
    for (let i = 0; i <= rows; i++) {
        const y = startY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(actualEndX, y); // 使用调整后的终点坐标
        ctx.stroke();
    }

    // 绘制垂直线
    for (let j = 0; j <= cols; j++) {
        const x = startX + j * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, actualEndY); // 使用调整后的终点坐标
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

    // 先绘制最外层大框线（始终为实线）
    ctx.beginPath();
    ctx.lineWidth = lineThickness;
    setLineStyle(ctx, 'solid', true); // 使用实线绘制外框
    ctx.rect(startX, startY, cols * lineSpacing, rows * lineSpacing);
    ctx.stroke();

    // 绘制内部格子
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = startX + j * lineSpacing;
            const y = startY + i * lineSpacing;
            const halfSpacing = lineSpacing / 2;

            // 绘制内部格子的外框
            setLineStyle(ctx, lineStyle);
            ctx.beginPath();
            ctx.lineWidth = lineThickness;
            ctx.rect(x, y, lineSpacing, lineSpacing);
            ctx.stroke();

            // 绘制对角线
            ctx.beginPath();
            ctx.lineWidth = lineThickness / 4;
            ctx.moveTo(x, y);
            ctx.lineTo(x + lineSpacing, y + lineSpacing);
            ctx.moveTo(x + lineSpacing, y);
            ctx.lineTo(x, y + lineSpacing);
            ctx.stroke();

            // 绘制十字线
            ctx.beginPath();
            ctx.lineWidth = lineThickness / 4;
            ctx.moveTo(x + halfSpacing, y);
            ctx.lineTo(x + halfSpacing, y + lineSpacing);
            ctx.moveTo(x, y + halfSpacing);
            ctx.lineTo(x + lineSpacing, y + halfSpacing);
            ctx.stroke();
        }
    }
}

// 绘制纸张的主函数
function drawPaper() {
    const paperSize = paperSizeSelect.value;
    const paperType = paperTypeSelect.value;
    const lineSpacing = parseFloat(lineSpacingInput.value) * 3.78; // 转换为像素
    const lineThickness = parseFloat(parseFloat(lineThicknessInput.value).toFixed(1));
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

    // 在所有绘制完成后添加水印
    drawWatermark(ctx, {
        displayWidth,
        displayHeight
    });
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
lineThicknessInput.addEventListener('input', (e) => {
    // 确保输入值保留一位小数
    e.target.value = parseFloat(e.target.value).toFixed(1);
    drawPaper();
});
lineColorInput.addEventListener('input', drawPaper);
lineStyleSelect.addEventListener('input', drawPaper); // 新增监听线条样式的更改
marginTopInput.addEventListener('input', drawPaper);
marginBottomInput.addEventListener('input', drawPaper);
marginLeftInput.addEventListener('input', drawPaper);
marginRightInput.addEventListener('input', drawPaper);

// 水印开关事件监听
enableWatermarkInput.addEventListener('change', (e) => {
    watermarkOptions.style.display = e.target.checked ? 'block' : 'none';
    drawPaper();
});

// 在现有的事件监听器后添加
marginsHeader.addEventListener('click', () => {
    const isExpanded = marginsContent.style.display === 'block';
    marginsContent.style.display = isExpanded ? 'none' : 'block';
    toggleIcon.classList.toggle('expanded');
});

// 水印绘制函数
function drawWatermark(ctx, config) {
    if (!enableWatermarkInput.checked) return;

    const { displayWidth, displayHeight } = config;
    const baseText = watermarkTextInput.value;
    const opacity = watermarkOpacityInput.value / 100;
    
    // 将0-100的进度值映射到-12°到40°的角度范围(超过这个范围水印效果不理想，暂时限制范围
    const progress = parseFloat(watermarkAngleInput.value);
    const angle = -12 + (progress / 100) * 52; // 52是角度范围（40 - (-12)）
    const angleInRadians = angle * Math.PI / 180;
    
    const fontSize = watermarkSizeInput.value;
    const color = watermarkColorInput.value;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;

    // 计算水印文本大小
    const textMetrics = ctx.measureText(baseText);
    const textWidth = textMetrics.width;

    // 动态生成足够长的水印文本
    const repeatCount = Math.ceil((displayWidth * 4) / textWidth);
    const extendedText = Array(repeatCount).fill(baseText).join('    ');

    // 设置水印间距
    const spacingY = fontSize * 10;

    // 计算水印的起始点
    const startX = -displayWidth;
    const startY = displayHeight + spacingY;

    // 绘制倾斜的水印
    for (let y = startY; y > -displayHeight; y -= spacingY) {
        ctx.save();
        ctx.translate(startX, y);
        ctx.rotate(angleInRadians);
        ctx.fillText(extendedText, 0, 0);
        ctx.restore();
    }

    ctx.restore();
}

// 修改水印角度的事件监听器
watermarkAngleInput.addEventListener('input', drawPaper);

// 设置默认角度（0对应-12度）
watermarkAngleInput.value = 0;

// 添加水印设置的事件监听器
watermarkTextInput.addEventListener('input', drawPaper);
watermarkOpacityInput.addEventListener('input', (e) => {
    opacityValue.textContent = e.target.value + '%';
    drawPaper();
});
watermarkAngleInput.addEventListener('input', (e) => {
    angleValue.textContent = e.target.value + '°';
    drawPaper();
});
watermarkSizeInput.addEventListener('input', drawPaper);
watermarkColorInput.addEventListener('input', drawPaper);

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