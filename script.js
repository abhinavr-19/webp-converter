const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const optionsDiv = document.getElementById('options');
const resultsDiv = document.getElementById('results');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('quality-value');

const originalPreview = document.getElementById('original-preview');
const originalSize = document.getElementById('original-size');
const webpPreview = document.getElementById('webp-preview');
const webpSize = document.getElementById('webp-size');
const sizeReduction = document.getElementById('size-reduction');
const downloadBtn = document.getElementById('download-btn');

let originalFile = null;

// --- Event Listeners ---
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
});

qualitySlider.addEventListener('input', () => {
    const quality = Math.round(qualitySlider.value * 100);
    qualityValue.textContent = `${quality}%`;
    if (originalFile) {
        convertImage(originalFile); // Re-convert on quality change
    }
});

// --- Core Functions ---

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        originalFile = file;
        optionsDiv.style.display = 'block';
        resultsDiv.style.display = 'block';
        displayOriginalImage(file);
        convertImage(file);
    } else {
        alert('Please select a valid image file (JPG, PNG).');
    }
}

function displayOriginalImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
    };
    reader.readAsDataURL(file);
}

function convertImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const quality = parseFloat(qualitySlider.value);
            const webpDataUrl = canvas.toDataURL('image/webp', quality);
            
            webpPreview.src = webpDataUrl;
            downloadBtn.href = webpDataUrl;
            downloadBtn.download = `${file.name.split('.').slice(0, -1).join('.')}.webp`;


            const webpBlob = dataURLToBlob(webpDataUrl);
            const webpFileSize = webpBlob.size;
            
            webpSize.textContent = formatFileSize(webpFileSize);
            
            const reduction = ((originalFile.size - webpFileSize) / originalFile.size) * 100;
            sizeReduction.textContent = `${reduction.toFixed(1)}%`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- Helper Utilities ---
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function dataURLToBlob(dataurl) {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}