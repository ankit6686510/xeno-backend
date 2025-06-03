// models/Segment.js
import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Segment name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Segment description is required"],
    },
    rules: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Segment rules are required"],
    },
    tags: [
      {
        type: String,
      },
    ],
    stats: {
      total_customers: {
        type: Number,
        default: 0,
      },
      active_customers: {
        type: Number,
        default: 0,
      },
      average_spend: {
        type: Number,
        default: 0,
      },
      last_activity: {
        type: Date,
        default: null,
      },
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
segmentSchema.index({ name: 1, created_by: 1 });
segmentSchema.index({ tags: 1 });
segmentSchema.index({ is_active: 1 });

export const Segment = mongoose.model("Segment", segmentSchema);
