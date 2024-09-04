// import { useRef } from "react"
// import React, { useState } from 'react'
// import Tesseract from 'tesseract.js';
// import { pdfjs } from 'react-pdf'

// pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'

// function App() {
//   const [text, setText] = useState('')
//   const [progress, setProgress] = useState(0);
//   const inputRef = useRef()

//   const handleSelectedFile = async(event) => {
//     setProgress(0);

//     const formData = new FormData()
//     formData.append('pdfFile', event.target.files[0])

//     const pdf = await pdfjs.getDocument(URL.createObjectURL(event.target.files[0])).promise;

//     let allText = '';

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const viewport = page.getViewport({ scale: 4 });
//       const canvas = document.createElement('canvas');
//       const context = canvas.getContext('2d');
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       await page.render({ canvasContext: context, viewport }).promise;
//       const extractedText = await Tesseract.recognize(
//         canvas,
//         "eng",
//         {
//           // langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
//           logger: m => {
//             if (m.status === 'recognizing text') {
//               setProgress((pageNum - 1) / pdf.numPages + m.progress / pdf.numPages);
//             }
//           }
//         },
//       ).then(({ data: { text } }) => text);

//       allText+= extractedText + '\n\n';
//     }

//     setText(allText)

//     // fetch('http://localhost:5000/upload', {
//     //   method: 'POST',
//     //   headers: {
//     //     'Content-Type': 'multipart/form-data'
//     //   },
//     //   body: formData
//     // }).then(res => res.text()).then(res => {
//     // setText(res)
//     // }).catch(err => {
//     //   console.log(err)
//     // })    

//   } 

//   return (
//     <div style={{display:"flex", flexDirection:"column",alignItems:"center"}}>
//       <h1>Extract text from PDF using OCR</h1>
//       <button style={{width:200, height:50}}
//       onClick={()=>inputRef.current.click()}>Upload a file</button>
//       <div style={{margin:"1rem"}}>Progress : {progress*100} %</div>
//       <input onChange={handleSelectedFile} ref={inputRef} type="file" hidden accept=".pdf"/>
//       <h3>Extracted text will be shown below:</h3>
//       <div style={{border:"2px solid black", width:700, height:"100vh",display:"flex", flexWrap:"wrap", borderRadius:"12px",padding:"1rem", overflowY:"scroll"}}>
//         {text}
//         </div>
//     </div>
//   )
// }

// export default App




// import { useRef, useState } from "react";
// import Tesseract from 'tesseract.js';
// import { pdfjs } from 'react-pdf';
// import { Document, Packer, Paragraph, TextRun } from 'docx';
// import { saveAs } from 'file-saver';

// pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

// function App() {
//   const [text, setText] = useState('');
//   const [progress, setProgress] = useState(0);
//   const inputRef = useRef();

//   const handleSelectedFile = async (event) => {
//     setProgress(0);
//     const file = event.target.files[0];
//     const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
//     let allText = '';

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const viewport = page.getViewport({ scale: 2 });
//       const canvas = document.createElement('canvas');
//       const context = canvas.getContext('2d');
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;
//       await page.render({ canvasContext: context, viewport }).promise;

//       const extractedText = await Tesseract.recognize(
//         canvas,
//         "eng",
//         {
//           logger: m => {
//             if (m.status === 'recognizing text') {
//               setProgress((pageNum - 1) / pdf.numPages + m.progress / pdf.numPages);
//             }
//           },
//           tessedit_pageseg_mode: '1',  // Automatic page segmentation with OSD
//           tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?()-',
//           tessjs_create_hocr: '1',  // Generate HOCR output
//           tessjs_create_tsv: '1',   // Generate TSV output
//         }
//       );

//       allText += `Page ${pageNum}:\n${extractedText.data.text}\n\n`;

//       // Process HOCR data to maintain structure
//       const hocrParser = new DOMParser();
//       const hocrDoc = hocrParser.parseFromString(extractedText.data.hocr, 'text/html');
//       const lines = hocrDoc.querySelectorAll('.ocr_line');
//       lines.forEach(line => {
//         const words = line.querySelectorAll('.ocrx_word');
//         const lineText = Array.from(words).map(word => word.textContent).join(' ');
//         allText += `${lineText}\n`;
//       });

//       allText += '\n';
//     }

//     setText(allText);
//     generateDocx(allText, file.name);
//   };

//   const generateDocx = (content, fileName) => {
//     const doc = new Document({
//       sections: [{
//         properties: {},
//         children: content.split('\n').map(line => 
//           new Paragraph({
//             children: [new TextRun(line)]
//           })
//         )
//       }]
//     });

//     Packer.toBlob(doc).then(blob => {
//       saveAs(blob, `${fileName.replace('.pdf', '')}_OCR.docx`);
//     });
//   };

//   return (
//     <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
//       <h1>Extract text from PDF using OCR</h1>
//       <button style={{width:200, height:50}} onClick={() => inputRef.current.click()}>Upload a file</button>
//       <div>{(progress * 100).toFixed(2)}%</div>
//       <input onChange={handleSelectedFile} ref={inputRef} type="file" hidden accept=".pdf"/>
//       <h3>Extracted text will be shown below:</h3>
//       <div style={{border:"2px solid black", width:700, height:"100vh", display:"flex", flexWrap:"wrap", borderRadius:"12px", padding:"1rem", overflowY:"scroll"}}>
//         {text}
//       </div>
//     </div>
//   );
// }

// export default App;


import { useRef, useState } from "react";
import Tesseract from 'tesseract.js';
import { pdfjs } from 'react-pdf';
import cv from '@techstark/opencv-js';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

function App() {
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  const preprocessImage = (img) => {
    const gray = new cv.Mat();
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

    const binary = new cv.Mat();
    cv.adaptiveThreshold(gray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

    gray.delete();
    return binary;
  };

  const handleSelectedFile = async (event) => {
    setProgress(0);
    const file = event.target.files[0];
    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
    let allText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 6 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;

      const img = cv.imread(canvas);
      const processedImg = preprocessImage(img);
      cv.imshow(canvas, processedImg);
      img.delete(); processedImg.delete();

      const { data: { text, hocr } } = await Tesseract.recognize(
        canvas,
        "ara+eng",
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress((pageNum - 1) / pdf.numPages + m.progress / pdf.numPages);
            }
          },
          tessedit_pageseg_mode: '1',
          tessjs_create_hocr: '1',
        }
      );

      allText += processHOCR(hocr, pageNum);
    }

    setText(allText);
  };

  const processHOCR = (hocr, pageNum) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(hocr, 'text/html');
    let structuredText = `Page ${pageNum}:\n\n`;

    const paragraphs = doc.querySelectorAll('.ocr_par');
    paragraphs.forEach((paragraph, index) => {
      const lines = paragraph.querySelectorAll('.ocr_line');
      lines.forEach(line => {
        const words = line.querySelectorAll('.ocrx_word');
        const lineText = Array.from(words).map(word => word.textContent).join(' ');
        structuredText += lineText + '\n';
      });
      if (index < paragraphs.length - 1) structuredText += '\n';
    });

    return structuredText + '\n';
  };

  return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
      <h1>Extract text from PDF using OCR</h1>
      <button style={{width:200, height:50}} onClick={() => inputRef.current.click()}>Upload a file</button>
      <div style={{margin:"1rem"}}>Progress : {(progress * 100).toFixed(2)} %</div>
      <input onChange={handleSelectedFile} ref={inputRef} type="file" hidden accept=".pdf"/>
      <h3>Extracted text:</h3>
      <pre style={{
        border:"2px solid black", 
        width:700, 
        height:"60vh", 
        borderRadius:"12px",
        padding:"1rem", 
        overflowY:"scroll",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      }}>
        {text}
      </pre>
    </div>
  );
}

export default App;
