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

// 绘制纸张的函数
function drawPaper() {
    const paperSize = paperSizeSelect.value;
    const paperType = paperTypeSelect.value;
    const lineSpacing = parseFloat(lineSpacingInput.value);
    const lineThickness = parseFloat(lineThicknessInput.value);
    const lineColor = lineColorInput.value;
    const marginTop = parseFloat(marginTopInput.value) * 3.78; // 转换为像素
    const marginBottom = parseFloat(marginBottomInput.value) * 3.78;
    const marginLeft = parseFloat(marginLeftInput.value) * 3.78;
    const marginRight = parseFloat(marginRightInput.value) * 3.78;

    // 设置 Canvas 尺寸
    const size = sizes[paperSize];
    canvas.width = size.width * 3.78; // 将毫米转换为像素
    canvas.height = size.height * 3.78;

    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置绘图样式
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;

    // 计算绘图区域（考虑页边距）
    const startX = marginLeft;
    const startY = marginTop;
    const endX = canvas.width - marginRight;
    const endY = canvas.height - marginBottom;
    const contentWidth = endX - startX;
    const contentHeight = endY - startY;

    // 根据纸张类型绘制
    if (paperType === 'lined') {
        // 绘制横线
        const lines = Math.floor(contentHeight / (lineSpacing * 3.78));
        const offsetY = (contentHeight - lines * lineSpacing * 3.78) / 2;
        for (let i = 0; i <= lines; i++) {
            const y = startY + offsetY + i * lineSpacing * 3.78;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    } else if (paperType === 'grid') {
        // 绘制方格
        const cols = Math.floor(contentWidth / (lineSpacing * 3.78));
        const rows = Math.floor(contentHeight / (lineSpacing * 3.78));
        const offsetX = (contentWidth - cols * lineSpacing * 3.78) / 2;
        const offsetY = (contentHeight - rows * lineSpacing * 3.78) / 2;

        for (let i = 0; i <= rows; i++) {
            const y = startY + offsetY + i * lineSpacing * 3.78;
            ctx.beginPath();
            ctx.moveTo(startX + offsetX, y);
            ctx.lineTo(endX - offsetX, y);
            ctx.stroke();
        }
        for (let j = 0; j <= cols; j++) {
            const x = startX + offsetX + j * lineSpacing * 3.78;
            ctx.beginPath();
            ctx.moveTo(x, startY + offsetY);
            ctx.lineTo(x, endY - offsetY);
            ctx.stroke();
        }
    } else if (paperType === 'dot') {
        // 绘制点阵
        const cols = Math.floor(contentWidth / (lineSpacing * 3.78));
        const rows = Math.floor(contentHeight / (lineSpacing * 3.78));
        const offsetX = (contentWidth - cols * lineSpacing * 3.78) / 2;
        const offsetY = (contentHeight - rows * lineSpacing * 3.78) / 2;

        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j <= cols; j++) {
                const x = startX + offsetX + j * lineSpacing * 3.78;
                const y = startY + offsetY + i * lineSpacing * 3.78;
                ctx.beginPath();
                ctx.arc(x, y, lineThickness * 2, 0, Math.PI * 2);
                ctx.fillStyle = lineColor;
                ctx.fill();
            }
        }
    } else if (paperType === 'mi') {
        // 绘制米字格
        const cols = Math.floor(contentWidth / (lineSpacing * 3.78));
        const rows = Math.floor(contentHeight / (lineSpacing * 3.78));
        const offsetX = (contentWidth - cols * lineSpacing * 3.78) / 2;
        const offsetY = (contentHeight - rows * lineSpacing * 3.78) / 2;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = startX + offsetX + j * lineSpacing * 3.78;
                const y = startY + offsetY + i * lineSpacing * 3.78;
                const halfSpacing = (lineSpacing * 3.78) / 2;

                // 绘制外框
                ctx.beginPath();
                ctx.rect(x, y, lineSpacing * 3.78, lineSpacing * 3.78);
                ctx.stroke();

                // 绘制对角线
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + lineSpacing * 3.78, y + lineSpacing * 3.78);
                ctx.moveTo(x + lineSpacing * 3.78, y);
                ctx.lineTo(x, y + lineSpacing * 3.78);
                ctx.stroke();

                // 绘制十字线
                ctx.beginPath();
                ctx.moveTo(x + halfSpacing, y);
                ctx.lineTo(x + halfSpacing, y + lineSpacing * 3.78);
                ctx.moveTo(x, y + halfSpacing);
                ctx.lineTo(x + lineSpacing * 3.78, y + halfSpacing);
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
    const link = document.createElement('a');
    link.download = 'paper.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 导出为 PDF
document.getElementById('export-pdf').addEventListener('click', () => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf; // 从 window.jspdf 中获取 jsPDF 构造函数
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [canvas.width / 3.78, canvas.height / 3.78] // 将像素转换为毫米
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3.78, canvas.height / 3.78);
    pdf.save('paper.pdf');
});