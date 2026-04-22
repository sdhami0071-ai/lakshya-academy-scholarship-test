// ==================================================================
// Lakshya Academy Scholarship Test — Backend
// Deploy: Extensions → Apps Script, paste this, Deploy → New deployment
//         → Type: Web app → Execute as: Me → Who has access: Anyone
// ==================================================================

const SHEET_ID = '1ovpsZeJUFtNbfjNdRu-h4m7M9Y7fWEkO7f5snKQdsKA'; 
const ANSWER_KEY = {
  1:'c',2:'c',3:'b',4:'d',5:'c',6:'b',7:'c',8:'b',9:'c',10:'b',
  11:'b',12:'b',13:'b',14:'b',15:'c',16:'b',17:'b',18:'b',19:'b',20:'b',
  21:'b',22:'c',23:'b',24:'b',25:'a',
  26:'c',27:'c',28:'a',29:'b',30:'a',31:'d',32:'a',33:'b',34:'a',35:'b',
  36:'b',37:'d',38:'b',39:'a',40:'c',41:'c',42:'c',43:'a',44:'b',45:'a',
  46:'d',47:'b',48:'a',49:'b',50:'b',
  51:'b',52:'b',53:'c',54:'b',55:'b',56:'b',57:'b',58:'a',59:'c',60:'b',
  61:'a',62:'a',63:'a',64:'a',65:'a',66:'b',67:'a',68:'a',69:'a',70:'a',
  71:'a',72:'a',73:'a',74:'c',75:'a',
  76:'a',77:'a',78:'c',79:'d',80:'a',81:'b',82:'b',83:'b',84:'b',85:'b',
  86:'c',87:'c',88:'c',89:'b',90:'c',91:'c',92:'c',93:'b',94:'b',95:'b',
  96:'c',97:'c',98:'c',99:'c',100:'c'
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'registerStudent') return registerStudent(data);
    if (data.action === 'submitTest') return submitTest(data);
    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doGet() {
  return jsonResponse({ status: 'Lakshya Scholarship Test API is live' });
}

function registerStudent(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Students');
  const lastRow = sheet.getLastRow();
  
  // Create student ID safely
  let serial = String(lastRow);
  while (serial.length < 4) {
    serial = '0' + serial;
  }
  const studentId = 'LKS-2026-' + serial;
  const attemptToken = Utilities.getUuid();
  const now = new Date();

  sheet.appendRow([
    studentId, now, data.fullName, data.guardianName,
    data.mobile, data.email, data.class, data.schoolName,
    attemptToken, 'Registered', now
  ]);

  return jsonResponse({
    success: true,
    studentId: studentId,
    attemptToken: attemptToken,
    startedAt: now.toISOString()
  });
}

function submitTest(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const studentsSheet = ss.getSheetByName('Students');
  const responsesSheet = ss.getSheetByName('Responses');

  // Verify token
  const students = studentsSheet.getDataRange().getValues();
  let studentRow = null;
  let studentRowIdx = -1;
  
  for (let i = 1; i < students.length; i++) {
    if (students[i][0] === data.studentId && students[i][8] === data.attemptToken) {
      studentRow = students[i];
      studentRowIdx = i + 1;
      break;
    }
  }
  
  if (!studentRow) return jsonResponse({ error: 'Invalid student or token' });
  if (studentRow[9] === 'Completed') return jsonResponse({ error: 'Test already submitted' });

  // Score the attempt
  const answers = data.answers || {};
  const sectionScores = { 
    'English': 0, 
    'Intelligence': 0, 
    'General Knowledge': 0, 
    'Mathematics': 0 
  };
  
  const sectionRanges = {
    'English': [1, 25],
    'Intelligence': [26, 50],
    'General Knowledge': [51, 75],
    'Mathematics': [76, 100]
  };

  let totalMarks = 0;
  let answerRow = [];
  
  for (let q = 1; q <= 100; q++) {
    const studentAns = (answers[q] || '').toLowerCase();
    answerRow.push(studentAns);
    
    if (studentAns && studentAns === ANSWER_KEY[q]) {
      totalMarks++;
      for (const sec in sectionRanges) {
        const lo = sectionRanges[sec][0];
        const hi = sectionRanges[sec][1];
        if (q >= lo && q <= hi) {
          sectionScores[sec]++;
        }
      }
    }
  }

  const startedAt = new Date(studentRow[10]);
  const submittedAt = new Date(data.submittedAt);
  const timeTakenMin = Math.round((submittedAt.getTime() - startedAt.getTime()) / 60000);
  const percentage = totalMarks;
  
  let band = 'Needs Improvement';
  if (percentage >= 85) band = 'Outstanding';
  else if (percentage >= 70) band = 'Excellent';
  else if (percentage >= 50) band = 'Good';

  // Build the final row cleanly
  let finalRow = [
    data.studentId, studentRow[2], studentRow[4], studentRow[5], studentRow[6],
    submittedAt, timeTakenMin, data.tabSwitches || 0
  ];
  
  finalRow = finalRow.concat(answerRow);
  
  finalRow = finalRow.concat([
    sectionScores['English'], sectionScores['Intelligence'],
    sectionScores['General Knowledge'], sectionScores['Mathematics'],
    totalMarks, 100, percentage, band
  ]);

  // Append to Responses
  responsesSheet.appendRow(finalRow);

  // Update Students sheet status
  studentsSheet.getRange(studentRowIdx, 10).setValue('Completed');

  return jsonResponse({
    success: true,
    totalMarks: totalMarks,
    totalOutOf: 100,
    percentage: percentage,
    sectionScores: sectionScores,
    band: band
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this ONCE manually to create headers in the sheets
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let s;

  s = ss.getSheetByName('Students');
  if (!s) s = ss.insertSheet('Students');
  s.clear();
  s.appendRow(['StudentID','Timestamp','FullName','GuardianName','Mobile','Email','Class','SchoolName','AttemptToken','Status','StartedAt']);
  s.getRange(1,1,1,11).setFontWeight('bold').setBackground('#0B2545').setFontColor('#D4A017');

  s = ss.getSheetByName('Responses');
  if (!s) s = ss.insertSheet('Responses');
  s.clear();
  
  let respHeaders = ['StudentID','FullName','Mobile','Email','Class','SubmittedAt','TimeTakenMin','TabSwitches'];
  for (let i = 1; i <= 100; i++) {
    respHeaders.push('Q' + i);
  }
  
  respHeaders = respHeaders.concat(['English_Score','Intelligence_Score','GK_Score','Maths_Score','TotalMarks','TotalOutOf','Percentage','Band']);
  s.appendRow(respHeaders);
  s.getRange(1,1,1,respHeaders.length).setFontWeight('bold').setBackground('#0B2545').setFontColor('#D4A017');
  s.setFrozenRows(1);
  s.setFrozenColumns(5);

  s = ss.getSheetByName('AnswerKey');
  if (!s) s = ss.insertSheet('AnswerKey');
  s.clear();
  s.appendRow(['QuestionNumber','Section','CorrectAnswer','Marks']);
  
  const sections = {
    'English': [1,25], 
    'Intelligence': [26,50], 
    'General Knowledge': [51,75], 
    'Mathematics': [76,100]
  };
  
  for (let q = 1; q <= 100; q++) {
    let sec = '';
    for (const k in sections) { 
      if (q >= sections[k][0] && q <= sections[k][1]) {
        sec = k;
      }
    }
    s.appendRow([q, sec, ANSWER_KEY[q], 1]);
  }
  s.getRange(1,1,1,4).setFontWeight('bold').setBackground('#0B2545').setFontColor('#D4A017');
}
