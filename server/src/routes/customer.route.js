import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomer,
  getCustomers,
  updateCustomer,
  uploadCustomersCSV
} from "../controllers/customer.controller.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.route("/create").post(authenticate, createCustomer);
router.route("/").get(authenticate, getCustomers);
router.route("/get").get(authenticate, getAllCustomers);
router.route("/:id").get(authenticate, getCustomer).delete(authenticate, deleteCustomer).put(authenticate, updateCustomer);
router.route("/upload-csv").post(authenticate, upload.single('file'), uploadCustomersCSV);

export default router;
