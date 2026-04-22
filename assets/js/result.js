document.addEventListener('DOMContentLoaded', () => {
    const resultDataStr = sessionStorage.getItem('result');
    const studentId = sessionStorage.getItem('studentId');

    if (!resultDataStr) {
        window.location.href = 'index.html';
        return;
    }

    const result = JSON.parse(resultDataStr);

    // Populate UI
    document.getElementById('totalMarks').innerText = `${result.totalMarks} / 100`;
    document.getElementById('percentage').innerText = `${result.percentage}%`;
    
    document.getElementById('englishScore').innerText = `${result.sectionScores.English || 0} / 25`;
    document.getElementById('intelScore').innerText = `${result.sectionScores.Intelligence || 0} / 25`;
    document.getElementById('gkScore').innerText = `${result.sectionScores['General Knowledge'] || 0} / 25`;
    document.getElementById('mathScore').innerText = `${result.sectionScores.Mathematics || 0} / 25`;

    const msgEl = document.getElementById('congratulationsMsg');
    
    if (result.band === 'Outstanding') {
        msgEl.innerText = "Outstanding! Direct call for counselling.";
        msgEl.className = "band-message band-outstanding";
    } else if (result.band === 'Excellent') {
        msgEl.innerText = "Excellent performance. You qualify for a scholarship.";
        msgEl.className = "band-message band-excellent";
    } else if (result.band === 'Good') {
        msgEl.innerText = "Good effort. Our mentors will contact you.";
        msgEl.className = "band-message band-good";
    } else {
        msgEl.innerText = "Thank you for attempting. Keep practicing!";
        msgEl.className = "band-message band-needs";
    }

    // Clean up session to prevent resubmission
    sessionStorage.clear();

    // PDF Download
    const downloadBtn = document.getElementById('downloadPdfBtn');
    downloadBtn.addEventListener('click', () => {
        const element = document.getElementById('resultContent');
        const opt = {
            margin:       1,
            filename:     `Lakshya_Result_${studentId || 'Student'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Needs html2pdf.js loaded from CDN in result.html
        html2pdf().set(opt).from(element).save();
    });
});
