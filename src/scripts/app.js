// 获取 DOM 元素
const paperSizeSelect = document.getElementById('paper-size');
const paperTypeSelect = document.getElementById('paper-type');
const lineSpacingInput = document.getElementById('line-spacing');
const lineThicknessInput = document.getElementById('line-thickness');
const lineColorInput = document.getElementById('line-color');
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

    // 设置 Canvas 尺寸
    const size = sizes[paperSize];
    canvas.width = size.width * 3.78; // 将毫米转换为像素
    canvas.height = size.height * 3.78;

    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置绘图样式
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;

    // 根据纸张类型绘制
    if (paperType === 'lined') {
        // 绘制横线
        for (let y = lineSpacing * 3.78; y < canvas.height; y += lineSpacing * 3.78) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    } else if (paperType === 'grid') {
        // 绘制方格（封闭边框）
        for (let y = 0; y <= canvas.height; y += lineSpacing * 3.78) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        for (let x = 0; x <= canvas.width; x += lineSpacing * 3.78) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        // 绘制外框
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    } else if (paperType === 'dot') {
        // 绘制点阵
        for (let y = lineSpacing * 3.78; y < canvas.height; y += lineSpacing * 3.78) {
            for (let x = lineSpacing * 3.78; x < canvas.width; x += lineSpacing * 3.78) {
                ctx.beginPath();
                ctx.arc(x, y, lineThickness * 2, 0, Math.PI * 2);
                ctx.fillStyle = lineColor;
                ctx.fill();
            }
        }
    } else if (paperType === 'mi') {
        // 绘制米字格
        for (let y = 0; y < canvas.height; y += lineSpacing * 3.78) {
            for (let x = 0; x < canvas.width; x += lineSpacing * 3.78) {
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