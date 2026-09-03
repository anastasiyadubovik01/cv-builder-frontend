export const getPdfStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

  :root {
    --background: #f5f5f7;
    --foreground: #2e2e2e;
    --primary: #c63031;
    --border: #aeaeae;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border-color: var(--border);
  }

  body {
    background-color: #ffffff;
    color: var(--foreground);
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .no-print {
    display: none !important;
  }

  .mx-auto { margin-left: auto; margin-right: auto; }
  .w-full { width: 100%; }
  .max-w-\\[900px\\] { max-width: 900px; }
  .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .pt-8 { padding-top: 2rem; }
  .pb-3 { padding-bottom: 0.75rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .pt-4 { padding-top: 1rem; }
  
  .text-foreground { color: var(--foreground); }

  .grid { display: grid; }
  .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .gap-8 { gap: 2rem; }
  .col-span-4 { grid-column: span 4 / span 4; }
  .col-span-8 { grid-column: span 8 / span 8; }

  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .justify-between { justify-content: space-between; }
  .items-baseline { align-items: baseline; }
  .items-start { align-items: flex-start; }
  .gap-5 { gap: 1.25rem; }

  .space-y-4 > * + * { margin-top: 1rem; }
  .space-y-4\\.5 > * + * { margin-top: 1.125rem; }

  .mb-8 { margin-bottom: 2rem; }
  .mb-12 { margin-bottom: 3rem; }
  .mb-\\[51px\\] { margin-bottom: 51px; }
  .mb-\\[33px\\] { margin-bottom: 33px; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-\\[10px\\] { margin-top: 10px; }

  .text-\\[34px\\] { font-size: 34px; line-height: 1.15; }
  .text-\\[16px\\] { font-size: 16px; line-height: 1.5; }
  .text-\\[14px\\] { font-size: 14px; line-height: 1.4; }
  .text-sm { font-size: 0.875rem; }
  .font-bold { font-weight: 700; }
  .font-medium { font-weight: 500; }
  .font-normal { font-weight: 400; }
  .uppercase { text-transform: uppercase; }
  .leading-\\[1\\.5\\] { line-height: 1.5; }
  .leading-relaxed { line-height: 1.625; }
  .tracking-tight { letter-spacing: -0.025em; }
  .tracking-\\[0\\.01em\\] { letter-spacing: 0.01em; }
  .whitespace-pre-line { white-space: pre-line; }
  .text-left { text-align: left; }
  .text-center { text-align: center; }

  .text-primary { color: var(--primary) !important; }
  .border-primary { border-color: var(--primary) !important; }
  .border { border-style: solid; border-width: 1px; }
  .border-l { border-left-style: solid; border-left-width: 1px; }
  .border-b { border-bottom-style: solid; border-bottom-width: 1px; }
  .divide-y > * + * { border-top-style: solid; border-top-width: 1px; }
  .divide-border > * + * { border-color: var(--border); }

  .list-disc { list-style-type: disc; }
  .pl-5 { padding-left: 1.25rem; }
  .pl-4 { padding-left: 1rem; }
  .pl-\\[25px\\] { padding-left: 25px; }
  
  table { width: 100%; border-collapse: collapse; }
  .w-1\\/3 { width: 33.333333%; }
  .w-\\[114px\\] { width: 114px; }
  .pt-2\\.5 { padding-top: 0.625rem; }
  .pb-8 { padding-bottom: 2rem; }
  .pb-7 { padding-bottom: 1.75rem; }
  .align-sub { vertical-align: baseline; }

  section, tr, .grid {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  @page {
    size: A4;
    margin: 10mm;
  }
`;
