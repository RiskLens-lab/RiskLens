import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function GET() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).text("RiskLens – Demo PDF", { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    "This is a demo export endpoint. In a full version, we would render a styled risk report " +
      "with flags, comments, and summary metrics."
  );
  doc.end();

  const buf = await done;
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=risklens-demo.pdf"
    }
  });
}
