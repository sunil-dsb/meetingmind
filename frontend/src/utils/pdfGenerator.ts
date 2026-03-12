import jsPDF from "jspdf";
import autoTable, { HookData } from "jspdf-autotable";
import { MeetingResult } from "@/types";

type AutoTableCapableDoc = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

export const generateMeetingPDF = (data: MeetingResult) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Colors
  const accentColor: [number, number, number] = [108, 99, 255]; // #6c63ff
  const secondaryColor: [number, number, number] = [167, 139, 250]; // #a78bfa
  const textColor: [number, number, number] = [45, 55, 72]; // Dark slate
  const mutedColor: [number, number, number] = [113, 128, 150]; // Gray

  let yPos = 25;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...accentColor);
  const splitTitle = doc.splitTextToSize(data.title || "Meeting Summary", contentWidth);
  doc.text(splitTitle, margin, yPos);
  yPos += splitTitle.length * 10 + 5;

  // Conversation Type Pill
  if (data.conversationType) {
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    const typeText = `TYPE: ${data.conversationType.toUpperCase()}`;
    const typeWidth = doc.getTextWidth(typeText);
    doc.setFillColor(243, 232, 255); // Light purple
    doc.roundedRect(margin, yPos - 5, typeWidth + 6, 8, 2, 2, "F");
    doc.text(typeText, margin + 3, yPos + 1);
    yPos += 15;
  }

  // Metadata Row
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  let metaText = `Date: ${data.date || "N/A"}`;
  if (data.duration) metaText += `  |  Duration: ${data.duration}`;
  if (data.speakers?.length) metaText += `  |  Participants: ${data.speakers.length}`;
  doc.text(metaText, margin, yPos);
  yPos += 10;

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Footer on all pages
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...mutedColor);
      doc.text(
        `MeetingMind Intelligence Report  |  Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
  };

  const ensureSpace = (needed: number) => {
    if (yPos + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // 1. One Line Summary
  if (data.oneLineSummary) {
    ensureSpace(20);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    const splitOneLine = doc.splitTextToSize(`"${data.oneLineSummary}"`, contentWidth);
    doc.text(splitOneLine, margin, yPos);
    yPos += splitOneLine.length * 6 + 10;
  }

  // 2. Full Summary
  if (data.summary) {
    ensureSpace(30);
    sectionTitle(doc, "EXECUTIVE SUMMARY", yPos, margin, accentColor);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    const splitSummary = doc.splitTextToSize(data.summary, contentWidth);
    doc.text(splitSummary, margin, yPos);
    yPos += splitSummary.length * 5 + 15;
  }

  // 3. Key Points
  if (data.keyPoints?.length) {
    ensureSpace(30);
    sectionTitle(doc, "KEY POINTS", yPos, margin, accentColor);
    yPos += 10;
    data.keyPoints.forEach((point) => {
      const splitPoint = doc.splitTextToSize(point, contentWidth - 10);
      ensureSpace(splitPoint.length * 5 + 5);
      doc.setFillColor(...accentColor);
      doc.circle(margin + 2, yPos - 1.5, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.text(splitPoint, margin + 8, yPos);
      yPos += splitPoint.length * 5 + 4;
    });
    yPos += 7;
  }

  // 4. Action Items Table
  if (data.actionItems?.length) {
    ensureSpace(40);
    sectionTitle(doc, "ACTION ITEMS", yPos, margin, accentColor);
    yPos += 8;

    const tableData = data.actionItems.map(item => [
      item.task || "",
      item.owner || "Unassigned",
      item.due || "TBD",
      (item.priority || "Medium").toUpperCase()
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Task', 'Owner', 'Due Date', 'Priority']],
      body: tableData,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: accentColor, textColor: 255, fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9, textColor: textColor },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 }
      },
      didDrawPage: (hookData: HookData) => {
        if (hookData.cursor) {
          yPos = hookData.cursor.y;
        }
      }
    });
    const tableFinalY = (doc as AutoTableCapableDoc).lastAutoTable?.finalY;
    yPos = (tableFinalY ?? yPos) + 15;
  }

  // 5. Decisions
  if (data.decisions?.length) {
    ensureSpace(30);
    sectionTitle(doc, "DECISIONS MADE", yPos, margin, [249, 115, 22]); // Orange
    yPos += 10;
    data.decisions.forEach((decision, i) => {
      const splitDecision = doc.splitTextToSize(decision, contentWidth - 10);
      ensureSpace(splitDecision.length * 5 + 5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(249, 115, 22);
      doc.text(`${i + 1}.`, margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      doc.text(splitDecision, margin + 10, yPos);
      yPos += splitDecision.length * 5 + 4;
    });
    yPos += 10;
  }

  // 6. Insights & Tone
  if (data.toneAnalysis || data.insights?.length) {
    ensureSpace(40);
    sectionTitle(doc, "ANALYSIS & INSIGHTS", yPos, margin, secondaryColor);
    yPos += 10;

    if (data.toneAnalysis) {
      ensureSpace(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...secondaryColor);
      doc.text("Tone Analysis:", margin, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      const splitTone = doc.splitTextToSize(data.toneAnalysis, contentWidth);
      doc.text(splitTone, margin, yPos);
      yPos += splitTone.length * 5 + 10;
    }

    if (data.insights?.length) {
      ensureSpace(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...secondaryColor);
      doc.text("Strategic Observations:", margin, yPos);
      yPos += 8;
      data.insights.forEach(insight => {
        const splitInsight = doc.splitTextToSize(`- ${insight}`, contentWidth);
        ensureSpace(splitInsight.length * 5 + 4);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text(splitInsight, margin, yPos);
        yPos += splitInsight.length * 5 + 3;
      });
      yPos += 10;
    }
  }

  // 7. Risks
  if (data.risks?.length) {
    ensureSpace(30);
    sectionTitle(doc, "POTENTIAL RISKS", yPos, margin, [239, 68, 68]); // Red
    yPos += 10;
    data.risks.forEach(risk => {
      const splitRisk = doc.splitTextToSize(risk, contentWidth - 8);
      ensureSpace(splitRisk.length * 5 + 5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(239, 68, 68);
      doc.text("!", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      doc.text(splitRisk, margin + 6, yPos);
      yPos += splitRisk.length * 5 + 4;
    });
    yPos += 10;
  }

  addFooter();
  doc.save(`MeetingMind_Report_${(data.title || 'Summary').replace(/\s+/g, '_')}.pdf`);
};

// Helper to draw section titles
function sectionTitle(doc: jsPDF, text: string, y: number, margin: number, color: [number, number, number]) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...color);
  doc.text(text, margin, y);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, margin + 25, y + 1.5);
}

