// models/Customer.js
import mongoose from "mongoose";
import { Segment } from "./segment.model.js";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: "India" },
  },
  demographics: {
    age: Number,
    gender: String,
    occupation: String,
  },
  stats: {
    total_spent: { type: Number, default: 0 },
    first_purchase: Date,
    last_purchase: Date,
    order_count: { type: Number, default: 0 },
    average_order_value: Number,
  },
  segments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Segment" }],
  tags: [String],
  // Added created_by field to associate customers with users
  // This ensures that customers are only visible to the user who created them
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Added created_by_email field to store the email of the user who created the customer
  created_by_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
  is_active: { type: Boolean, default: true },
});

// Update timestamps on save
customerSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Add compound index for created_by and created_by_email
customerSchema.index({ created_by: 1, created_by_email: 1 });

export const Customer = mongoose.model("Customer", customerSchema);
