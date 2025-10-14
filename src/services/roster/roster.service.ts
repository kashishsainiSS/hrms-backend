import { Request, Response } from "express";
import {bulkUpload,createRoster,getAllRosters,getRosterByEmployee,updateRoster} from "../../repository/roster/roster.repository";
import Roster, { IRoster } from "../../schemas/Roster/Roster.schema";
import * as XLSX from "xlsx";

/**
 * 🧩 Parse Excel (supports file path or base64 string)
 */
export function parseRosterExcel(source: string, isBase64 = false) {
  let workbook: XLSX.WorkBook;

  if (isBase64) {
    // 🧠 Auto-strip data URL prefix if present
    const cleanBase64 = source.includes(",")
      ? source.split(",")[1]
      : source.trim();

    // Decode base64 → Buffer
    const buffer = Buffer.from(cleanBase64, "base64");
    workbook = XLSX.read(buffer, { type: "buffer" });
  } else {
    // Read from file path
    workbook = XLSX.readFile(source);
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (!rows || rows.length < 3) {
    throw new Error("Invalid roster Excel format. Expected at least 3 rows.");
  }

  const daysRow = rows[0];
  const headerRow = rows[1];
  const dataRows = rows.slice(2);

  const normalize = (v: any) =>
    (v ?? "").toString().toLowerCase().replace(/[\s\.\-_/\\]+/g, "");

  const findIndexByCandidates = (cands: string[]) => {
    for (const c of cands) {
      const idx = headerRow.findIndex((h) => normalize(h) === normalize(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idxEmpId = findIndexByCandidates(["Emp. ID", "EmpID", "Employee ID"]);
  const idxName = findIndexByCandidates(["Agent Name", "Name"]);
  const idxCRM = findIndexByCandidates(["CRM NAME", "CRM"]);
  const idxTitle = findIndexByCandidates(["Title", "Role"]);
  const idxShift = findIndexByCandidates(["Shift Time", "Shift"]);
  const idxTL = findIndexByCandidates(["Team Leader", "TL"]);

  let dayStartIndex =
    idxTL !== -1
      ? idxTL + 1
      : headerRow.findIndex((h, i) => {
          if (typeof h === "number") return true;
          if (h && !isNaN(Number(h))) return true;
          if (typeof h === "string" && !isNaN(Date.parse(h))) return true;
          if (daysRow[i]) return true;
          return false;
        });

  if (dayStartIndex === -1) {
    const lastFixed = Math.max(idxEmpId, idxName, idxCRM, idxTitle, idxShift, idxTL);
    dayStartIndex = lastFixed + 1;
  }

  const dayIndices = headerRow.slice(dayStartIndex).map((_, i) => dayStartIndex + i);

  const parseHeaderToDate = (val: any): Date | null => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "number") {
      const parsed = XLSX.SSF.parse_date_code(val);
      if (parsed && parsed.y) return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
    if (typeof val === "string" && /^\d+$/.test(val)) {
      const num = Number(val);
      const parsed = XLSX.SSF.parse_date_code(num);
      if (parsed && parsed.y) return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
    const ms = Date.parse(val);
    return isNaN(ms) ? null : new Date(ms);
  };

  const rosterEntries: any[] = [];

  dataRows.forEach((row) => {
    const empId = row[idxEmpId];
    if (!empId) return;

    dayIndices.forEach((colIdx) => {
      const headerVal = headerRow[colIdx];
      const parsedDate = parseHeaderToDate(headerVal);
      const dayNameRaw = daysRow[colIdx]?.toString().trim() || "";
      const dayName =
        dayNameRaw ||
        (parsedDate ? parsedDate.toLocaleDateString("en-GB", { weekday: "short" }) : "");

      const statusCell = row[colIdx];
      const status = statusCell?.toString().trim() || "P";

      rosterEntries.push({
        empId,
        name: idxName !== -1 ? row[idxName] : "",
        crmName: idxCRM !== -1 ? row[idxCRM] : "",
        title: idxTitle !== -1 ? row[idxTitle] : "",
        shiftTime: idxShift !== -1 ? row[idxShift] : "",
        teamLeader: idxTL !== -1 ? row[idxTL] : "",
        date: parsedDate ?? undefined,
        day: dayName,
        status,
      });
    });
  });

  return rosterEntries;
}


export const BulkRosterUpload = async (req: Request, res: Response) => {
  try {
    let rosterEntries: IRoster[] = [];

    if (req.file?.path) {
      // file upload (multer)
      rosterEntries = parseRosterExcel(req.file.path);
    } else if (req.body.file) {
      // base64 Excel payload
      rosterEntries = parseRosterExcel(req.body.file, true);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No Excel file provided (file or base64)" });
    }

    const data = await bulkUpload(rosterEntries);
    return res.json({ success: true, count: rosterEntries.length, data });
  } catch (error) {
    console.error("BulkRosterUpload error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error processing Excel", error });
  }
};


export const CreateRosterService = async (req: Request, res: Response) => {
  try {
    const data = await createRoster(req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ status:"error", message: err.message });
  }
};


export const getAllRoster = async (req:Request, res:Response)=>{
  try {

 const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result: any = await getAllRosters(page, limit, search);
    if(result.status =="success"){
      return res.status(200).json({status:"success",
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalRecords: result.totalRecords,
        });
    }else{
      return res.status(400).json({status:"error", data:result.data});
    }
  } catch (error:any) {
    return res.status(500).json({
      status:"error",
      message:error.message
    })
  }
}