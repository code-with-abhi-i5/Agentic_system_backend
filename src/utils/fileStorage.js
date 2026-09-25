import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");

// Ensure data directory exists
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile(filename, defaultValue = []) {
  try {
    ensureDir();
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    logger.warn(`[FileStorage] Error reading ${filename}: ${err.message}`);
    return defaultValue;
  }
}

function writeJsonFile(filename, data) {
  try {
    ensureDir();
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    logger.error(`[FileStorage] Error writing ${filename}: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// DATASETS STORAGE
// ═══════════════════════════════════════════════════════════════
export const fileStorage = {
  // Datasets
  getDatasets() {
    return readJsonFile("datasets.json", []);
  },
  saveDataset(dataset) {
    const list = this.getDatasets();
    const id = dataset._id || dataset.id || `ds-${Date.now()}`;
    const item = {
      ...dataset,
      _id: id,
      id,
      createdAt: dataset.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const index = list.findIndex((d) => (d._id || d.id) === id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    writeJsonFile("datasets.json", list);
    return item;
  },
  getDatasetById(id) {
    const list = this.getDatasets();
    return list.find((d) => (d._id || d.id) === id || (d.id && String(d.id) === String(id))) || null;
  },
  deleteDataset(id) {
    const list = this.getDatasets();
    const filtered = list.filter((d) => (d._id || d.id) !== id);
    writeJsonFile("datasets.json", filtered);
    return true;
  },

  // Users
  getUsers() {
    return readJsonFile("users.json", []);
  },
  saveUser(user) {
    const list = this.getUsers();
    const id = user._id || user.id || `usr-${Date.now()}`;
    const item = {
      ...user,
      _id: id,
      id,
      createdAt: user.createdAt || new Date().toISOString(),
    };
    const index = list.findIndex((u) => (u._id || u.id) === id || u.email?.toLowerCase() === user.email?.toLowerCase());
    if (index >= 0) {
      list[index] = { ...list[index], ...item };
    } else {
      list.push(item);
    }
    writeJsonFile("users.json", list);
    return item;
  },
  findUserByEmail(email) {
    if (!email) return null;
    const list = this.getUsers();
    return list.find((u) => u.email?.toLowerCase() === email.toLowerCase().trim()) || null;
  },
  findUserById(id) {
    if (!id) return null;
    const list = this.getUsers();
    return list.find((u) => (u._id || u.id) === id || String(u._id) === String(id)) || null;
  },

  // Tasks
  getTasks() {
    return readJsonFile("tasks.json", []);
  },
  saveTask(task) {
    const list = this.getTasks();
    const id = task.taskId || task._id || `task-${Date.now()}`;
    const item = {
      ...task,
      taskId: id,
      updatedAt: new Date().toISOString(),
    };
    const index = list.findIndex((t) => t.taskId === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...item };
    } else {
      list.unshift(item);
    }
    writeJsonFile("tasks.json", list);
    return item;
  },
  getTaskById(taskId) {
    const list = this.getTasks();
    return list.find((t) => t.taskId === taskId) || null;
  },
};
