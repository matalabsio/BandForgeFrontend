"use client";

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

async function renderCardPng(cardEl: HTMLElement): Promise<string> {
  return toPng(cardEl, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });
}

async function dataUriToBlob(dataUri: string): Promise<Blob> {
  const res = await fetch(dataUri);
  return res.blob();
}

function downloadUri(uri: string, filename: string): void {
  const link = document.createElement("a");
  link.href = uri;
  link.download = filename;
  link.click();
}

export async function downloadDailyReportPng(cardEl: HTMLElement): Promise<void> {
  const pngDataUri = await renderCardPng(cardEl);
  downloadUri(pngDataUri, `bandforge-daily-report-${fileStamp()}.png`);
}

export async function buildDailyReportPngFile(cardEl: HTMLElement): Promise<File> {
  const pngDataUri = await renderCardPng(cardEl);
  const blob = await dataUriToBlob(pngDataUri);
  return new File([blob], `bandforge-daily-report-${fileStamp()}.png`, {
    type: "image/png",
  });
}

export async function downloadDailyReportPdf(cardEl: HTMLElement): Promise<void> {
  const pngDataUri = await renderCardPng(cardEl);
  const img = new Image();
  img.src = pngDataUri;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to render report image."));
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const targetW = pageW - margin * 2;
  const targetH = targetW * (4 / 3);
  const fitH = Math.min(targetH, pageH - margin * 2);
  const fitW = fitH * (3 / 4);
  const x = (pageW - fitW) / 2;
  const y = (pageH - fitH) / 2;

  pdf.addImage(pngDataUri, "PNG", x, y, fitW, fitH, undefined, "FAST");
  pdf.save(`bandforge-daily-report-${fileStamp()}.pdf`);
}
