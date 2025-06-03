import mongoose from "mongoose";
import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";

// Helper function for error handling
const handleError = (res, error, message = "An error occurred") => {
  console.error(error);
  res.status(500).json({
    success: false,
    message,
    error: error.message,
  });
};

// Helper function to verify user email
const verifyUserEmail = async (userId, userEmail) => {
  const user = await User.findById(userId);
  if (!user || user.email !== userEmail) {
    return false;
  }
  return true;
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    const userEmail = req.user.email;

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields",
      });
    }

    // Verify user email
    const isEmailVerified = await verifyUserEmail(req.user._id, userEmail);
    if (!isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Email verification failed",
      });
    }

    const customer = new Customer({
      ...customerData,
      created_by: req.user._id,
      created_by_email: userEmail, // Store the email of the user who created the customer
    });
    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    handleError(res, error, "Failed to create customer");
  }
};

// Get all customers with pagination and filtering
export const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sort = "-created_at",
      city = "",
      gender = "",
    } = req.query;

    const userEmail = req.user.email;

    // Verify user email
    const isEmailVerified = await verifyUserEmail(req.user._id, userEmail);
    if (!isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Email verification failed",
      });
    }

    const skip = (page - 1) * limit;

    // Build filter object dynamically
    const filter = {
      created_by: req.user._id,
      created_by_email: userEmail, // Add email verification
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Add optional filters
    if (city) filter["address.city"] = { $regex: city, $options: "i" };
    if (gender) filter["demographics.gender"] = gender.toLowerCase();

    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("segments");

    const total = await Customer.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch customers");
  }
};

// Get single customer
export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Verify user email
    const isEmailVerified = await verifyUserEmail(req.user._id, userEmail);
    if (!isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Email verification failed",
      });
    }

    const customer = await Customer.findOne({
      _id: id,
      created_by: req.user._id,
      created_by_email: userEmail, // Add email verification
    }).populate("segments");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch customer");
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userEmail = req.user.email;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Verify user email
    const isEmailVerified = await verifyUserEmail(req.user._id, userEmail);
    if (!isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Email verification failed",
      });
    }

    // Prevent email updates if provided
    if (updateData.email) {
      delete updateData.email;
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: id,
        created_by: req.user._id,
        created_by_email: userEmail, // Add email verification
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to update customer");
  }
};

// Delete customer (soft delete)
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Verify user email
    const isEmailVerified = await verifyUserEmail(req.user._id, userEmail);
    if (!isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Email verification failed",
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: id,
        created_by: req.user._id,
        created_by_email: userEmail, // Add email verification
      },
      { is_active: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to deactivate customer");
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    // Add created_by filter to ensure users can only see their own customers
    const customers = await Customer.find({ created_by: req.user._id }).populate("segments");

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve customers",
    });
  }
};

// Upload customers via CSV
export const uploadCustomersCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file"
      });
    }

    const userEmail = req.user.email;

    // Verify user email
    const isEmailVerified = await verifyUserEmail(req.user._id, userEmail);
    if (!isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Email verification failed",
      });
    }

    const csvData = req.file.buffer.toString();
    const rows = csvData.split('\n');
    const headers = rows[0].split(',').map(header => header.trim());

    // Validate required headers
    const requiredHeaders = ['name', 'email', 'phone'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required headers: ${missingHeaders.join(', ')}`
      });
    }

    const customers = [];
    const errors = [];

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows

      const values = rows[i].split(',').map(value => value.trim());
      const customer = {
        created_by: req.user._id,
        created_by_email: userEmail, // Add email of the user who uploaded
      };

      // Map CSV values to customer object
      headers.forEach((header, index) => {
        if (header === 'name') customer.name = values[index];
        else if (header === 'email') customer.email = values[index];
        else if (header === 'phone') customer.phone = values[index];
        else if (header === 'city') customer.address = { ...customer.address, city: values[index] };
        else if (header === 'state') customer.address = { ...customer.address, state: values[index] };
        else if (header === 'country') customer.address = { ...customer.address, country: values[index] };
        else if (header === 'gender') customer.demographics = { ...customer.demographics, gender: values[index] };
        else if (header === 'age') customer.demographics = { ...customer.demographics, age: parseInt(values[index]) || 0 };
        else if (header === 'occupation') customer.demographics = { ...customer.demographics, occupation: values[index] };
      });

      // Validate required fields
      if (!customer.name || !customer.email || !customer.phone) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      // Add default values for optional fields
      customer.stats = {
        total_spent: 0,
        order_count: 0,
        last_purchase: null
      };
      customer.is_active = true;

      customers.push(customer);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some rows had errors',
        errors
      });
    }

    // Insert customers in batches
    const batchSize = 100;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      await Customer.insertMany(batch, { ordered: false });
    }

    res.status(200).json({
      success: true,
      message: `Successfully imported ${customers.length} customers`,
      data: customers
    });
  } catch (error) {
    console.error('CSV Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process CSV file',
      error: error.message
    });
  }
};
