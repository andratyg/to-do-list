// Secure, Zero-Dependency Excel & JSON Export Utility
// Compliant with SSDLC (No third-party vulnerable prototype pollution packages)

export function exportFinanceExcel(transactions = [], userName = "User") {
  const totalMasuk = transactions
    .filter((t) => t.type === "in")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalKeluar = transactions
    .filter((t) => t.type === "out")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const sisaSaldo = totalMasuk - totalKeluar;
  const dateStr = new Date().toLocaleDateString("id-ID");

  // Generate Excel XML Spreadsheet 2003 format (native support in Excel/WPS/Sheets)
  let rowsXml = "";

  // Title row
  rowsXml += `
    <Row>
      <Cell ss:MergeAcross="6" ss:StyleID="Title"><Data ss:Type="String">LAPORAN KEUANGAN STUDENT WORKSPACE PRO</Data></Cell>
    </Row>
    <Row>
      <Cell ss:MergeAcross="6" ss:StyleID="SubTitle"><Data ss:Type="String">Dibuat oleh: ${escapeXml(userName)} | Tanggal: ${dateStr}</Data></Cell>
    </Row>
    <Row></Row>
    <Row>
      <Cell ss:StyleID="Header"><Data ss:Type="String">No</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Tanggal</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Keterangan</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Kategori</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Dompet</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Tipe</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Jumlah (Rp)</Data></Cell>
    </Row>
  `;

  transactions.forEach((t, idx) => {
    const isIncome = t.type === "in";
    const amountVal = Number(t.amount) || 0;
    rowsXml += `
      <Row>
        <Cell ss:StyleID="Center"><Data ss:Type="Number">${idx + 1}</Data></Cell>
        <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml(t.date || "-")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(t.desc || "-")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(t.category || "Umum")}</Data></Cell>
        <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml((t.wallet || "Cash").toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="${isIncome ? "Income" : "Expense"}"><Data ss:Type="String">${isIncome ? "Pemasukan" : "Pengeluaran"}</Data></Cell>
        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${amountVal}</Data></Cell>
      </Row>
    `;
  });

  // Summary rows
  rowsXml += `
    <Row></Row>
    <Row>
      <Cell ss:MergeAcross="5" ss:StyleID="SummaryLabel"><Data ss:Type="String">Total Pemasukan:</Data></Cell>
      <Cell ss:StyleID="CurrencyIncome"><Data ss:Type="Number">${totalMasuk}</Data></Cell>
    </Row>
    <Row>
      <Cell ss:MergeAcross="5" ss:StyleID="SummaryLabel"><Data ss:Type="String">Total Pengeluaran:</Data></Cell>
      <Cell ss:StyleID="CurrencyExpense"><Data ss:Type="Number">${totalKeluar}</Data></Cell>
    </Row>
    <Row>
      <Cell ss:MergeAcross="5" ss:StyleID="SummaryLabel"><Data ss:Type="String">Sisa Saldo Kas:</Data></Cell>
      <Cell ss:StyleID="CurrencyBalance"><Data ss:Type="Number">${sisaSaldo}</Data></Cell>
    </Row>
  `;

  const excelTemplate = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#4F46E5"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="SubTitle">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#6B7280"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="Center">
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="Income">
      <Font ss:Color="#059669" ss:Bold="1"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="Expense">
      <Font ss:Color="#DC2626" ss:Bold="1"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="&quot;Rp&quot;\ #,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="CurrencyIncome">
      <Font ss:Color="#059669" ss:Bold="1"/>
      <NumberFormat ss:Format="&quot;Rp&quot;\ #,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="CurrencyExpense">
      <Font ss:Color="#DC2626" ss:Bold="1"/>
      <NumberFormat ss:Format="&quot;Rp&quot;\ #,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="CurrencyBalance">
      <Font ss:Color="#4F46E5" ss:Bold="1"/>
      <NumberFormat ss:Format="&quot;Rp&quot;\ #,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="SummaryLabel">
      <Font ss:Bold="1"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Laporan Keuangan">
    <Table ss:DefaultColumnWidth="100">
      <Column ss:Width="40"/>
      <Column ss:Width="90"/>
      <Column ss:Width="200"/>
      <Column ss:Width="110"/>
      <Column ss:Width="80"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      ${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([excelTemplate], {
    type: "application/vnd.ms-excel;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_Keuangan_${userName.replace(/[^a-zA-Z0-9_]/g, "_")}_${new Date().toISOString().split("T")[0]}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function exportFullJson(data, userName = "User") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `StudentWorkspace_${userName.replace(/[^a-zA-Z0-9_]/g, "_")}_backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}
