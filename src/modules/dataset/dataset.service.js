import mongoose from "mongoose";
import { Dataset } from "./dataset.model.js";
import { Parser } from "json2csv";
import { fileStorage } from "../../utils/fileStorage.js";

export const createDataset = async (datasetData) => {
  let created = null;
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Dataset.create(datasetData);
      created = doc.toObject ? doc.toObject() : doc;
    } catch (e) {
      console.warn("MongoDB create failed, falling back to disk:", e.message);
    }
  }
  if (!created) {
    created = {
      ...datasetData,
      _id: `ds-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }
  // Mirror to persistent disk storage (ensures zero data loss on restart)
  fileStorage.saveDataset(created);
  return created;
};

export const getAllDatasets = async ({ limit = 20, skip = 0, search = "", userId = null } = {}) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const query = {};
      if (userId) {
        query.userId = userId;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { prompt: { $regex: search, $options: "i" } },
        ];
      }
      const [datasets, total] = await Promise.all([
        Dataset.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Dataset.countDocuments(query),
      ]);
      if (datasets && datasets.length > 0) {
        return { datasets, total };
      }
    } catch (e) {
      console.warn("MongoDB find failed, falling back to disk:", e.message);
    }
  }

  // Persistent disk storage
  let list = fileStorage.getDatasets();
  if (userId) {
    list = list.filter((d) => !d.userId || String(d.userId) === String(userId));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (d) =>
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.prompt && d.prompt.toLowerCase().includes(q))
    );
  }
  return { datasets: list.slice(skip, skip + limit), total: list.length };
};

export const getDatasetById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const found = await Dataset.findById(id).lean();
      if (found) return found;
    } catch (e) {
      // id might not be ObjectId
    }
  }
  return fileStorage.getDatasetById(id);
};

export const queryDatasetRecords = async (
  id,
  { search = "", category = "ALL", sortField = "confidence", sortOrder = "desc", page = 1, limit = 10 } = {}
) => {
  const dataset = await getDatasetById(id);
  if (!dataset) {
    throw new Error("Dataset not found");
  }

  let records = dataset.records || [];

  // 1. Search Filter
  if (search) {
    const q = search.toLowerCase();
    records = records.filter(
      (r) =>
        (r.company && r.company.toLowerCase().includes(q)) ||
        (r.founder && r.founder.toLowerCase().includes(q)) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        (r.techStack && r.techStack.toLowerCase().includes(q))
    );
  }

  // 2. Category Filter
  if (category && category !== "ALL") {
    records = records.filter((r) => r.category === category);
  }

  // 3. Sorting
  records.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 4. Pagination
  const total = records.length;
  const startIndex = (page - 1) * limit;
  const paginatedRecords = records.slice(startIndex, startIndex + limit);

  return {
    datasetId: dataset._id,
    title: dataset.title,
    prompt: dataset.prompt,
    stats: dataset.stats,
    schemaDefinition: dataset.schemaDefinition,
    records: paginatedRecords,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const generateExportContent = async (id, format = "csv") => {
  const dataset = await getDatasetById(id);
  if (!dataset) {
    throw new Error("Dataset not found");
  }

  const records = dataset.records || [];
  const filename = `${dataset.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}`;

  if (format === "json") {
    return {
      content: JSON.stringify(records, null, 2),
      contentType: "application/json",
      filename: `${filename}.json`,
    };
  }

  if (format === "csv") {
    // Generate clean CSV using json2csv Parser
    const parser = new Parser({
      fields: [
        { label: "Company", value: "company" },
        { label: "Category", value: "category" },
        { label: "Founder", value: "founder" },
        { label: "Role", value: "role" },
        { label: "Email", value: "email" },
        { label: "Location", value: "location" },
        { label: "Funding", value: "funding" },
        { label: "Tech Stack", value: "techStack" },
        { label: "Confidence", value: "confidence" },
        { label: "Source URL", value: "sourceUrl" },
        { label: "Source Domain", value: "sourceDomain" },
        { label: "Extracted At", value: "scrapedAt" },
      ],
    });

    const csv = parser.parse(records);
    return {
      content: csv,
      contentType: "text/csv; charset=utf-8",
      filename: `${filename}.csv`,
    };
  }

  // Fallback Tab-separated for Excel compatibility
  const headers = ["Company\tCategory\tFounder\tRole\tEmail\tLocation\tFunding\tTechStack\tConfidence\tSourceUrl\n"];
  const rows = records.map(
    (r) =>
      `${r.company || ""}\t${r.category || ""}\t${r.founder || ""}\t${r.role || ""}\t${r.email || ""}\t${r.location || ""}\t${r.funding || ""}\t${r.techStack || ""}\t${r.confidence || ""}\t${r.sourceUrl || ""}`
  );
  return {
    content: headers.concat(rows.join("\n")).join(""),
    contentType: "application/vnd.ms-excel",
    filename: `${filename}.xls`,
  };
};

export const updateDatasetSuggestions = async (id, suggestions) => {
  if (!id || !Array.isArray(suggestions) || suggestions.length === 0) return;

  if (mongoose.connection.readyState === 1) {
    try {
      await Dataset.updateOne(
        { $or: [{ _id: id }, { id: id }] },
        { $set: { suggestedQuestions: suggestions } }
      );
    } catch (e) {
      console.warn("MongoDB update suggestions failed:", e.message);
    }
  }

  try {
    const diskDataset = fileStorage.getDatasetById(id);
    if (diskDataset) {
      diskDataset.suggestedQuestions = suggestions;
      fileStorage.saveDataset(diskDataset);
    }
  } catch (err) {
    console.warn("Disk update suggestions failed:", err.message);
  }
};

