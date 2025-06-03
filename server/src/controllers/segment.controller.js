import { Segment } from "../models/segment.model.js";
import { Customer } from "../models/customer.model.js";

const createSegment = async (req, res) => {
  try {
    const { name, description, rules, tags } = req.body;

    // Create new segment
    const segment = await Segment.create({
      name,
      description,
      rules,
      tags,
      created_by: req.user._id,
    });

    // Calculate initial stats
    const stats = await calculateSegmentStats(segment);
    segment.stats = stats;
    await segment.save();

    return res.status(201).json({
      success: true,
      message: "Segment created successfully",
      data: segment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create segment",
      error: error.message,
    });
  }
};

const getSegments = async (req, res) => {
  try {
    const segments = await Segment.find({ created_by: req.user._id, is_active: true })
      .sort({ createdAt: -1 })
      .populate("created_by", "name email");

    return res.status(200).json({
      success: true,
      message: "Segments fetched successfully",
      data: segments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch segments",
      error: error.message,
    });
  }
};

const getSegmentById = async (req, res) => {
  try {
    const segment = await Segment.findOne({
      _id: req.params.id,
      created_by: req.user._id,
      is_active: true,
    }).populate("created_by", "name email");

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Segment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Segment fetched successfully",
      data: segment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch segment",
      error: error.message,
    });
  }
};

const updateSegment = async (req, res) => {
  try {
    const { name, description, rules, tags } = req.body;

    const segment = await Segment.findOneAndUpdate(
      {
        _id: req.params.id,
        created_by: req.user._id,
        is_active: true,
      },
      {
        name,
        description,
        rules,
        tags,
      },
      { new: true }
    );

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Segment not found",
      });
    }

    // Recalculate stats
    const stats = await calculateSegmentStats(segment);
    segment.stats = stats;
    await segment.save();

    return res.status(200).json({
      success: true,
      message: "Segment updated successfully",
      data: segment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update segment",
      error: error.message,
    });
  }
};

const deleteSegment = async (req, res) => {
  try {
    const segment = await Segment.findOneAndUpdate(
      {
        _id: req.params.id,
        created_by: req.user._id,
        is_active: true,
      },
      { is_active: false },
      { new: true }
    );

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Segment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Segment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete segment",
      error: error.message,
    });
  }
};

const calculateSegmentStats = async (segment) => {
  try {
    // Build query based on segment rules
    const query = buildSegmentQuery(segment.rules);
    query.is_active = true;

    // Get total customers
    const totalCustomers = await Customer.countDocuments(query);

    // Get active customers (customers with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeCustomers = await Customer.countDocuments({
      ...query,
      last_activity: { $gte: thirtyDaysAgo },
    });

    // Calculate average spend
    const customers = await Customer.find(query).select("total_spent");
    const totalSpend = customers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
    const averageSpend = totalCustomers > 0 ? totalSpend / totalCustomers : 0;

    // Get last activity
    const lastActivity = await Customer.findOne(query)
      .sort({ last_activity: -1 })
      .select("last_activity");

    return {
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      average_spend: averageSpend,
      last_activity: lastActivity?.last_activity || null,
    };
  } catch (error) {
    console.error("Error calculating segment stats:", error);
    return {
      total_customers: 0,
      active_customers: 0,
      average_spend: 0,
      last_activity: null,
    };
  }
};

const buildSegmentQuery = (rules) => {
  const query = {};

  rules.forEach((rule) => {
    try {
      const parsedRule = JSON.parse(rule);
      const { field, operator, value } = parsedRule;

      switch (operator) {
        case ">":
          query[field] = { $gt: value };
          break;
        case "<":
          query[field] = { $lt: value };
          break;
        case ">=":
          query[field] = { $gte: value };
          break;
        case "<=":
          query[field] = { $lte: value };
          break;
        case "==":
          query[field] = value;
          break;
        case "!=":
          query[field] = { $ne: value };
          break;
        case "contains":
          query[field] = { $regex: value, $options: "i" };
          break;
        case "not_contains":
          query[field] = { $not: { $regex: value, $options: "i" } };
          break;
        case "exists":
          query[field] = { $exists: true };
          break;
        case "not_exists":
          query[field] = { $exists: false };
          break;
      }
    } catch (error) {
      console.error("Error parsing rule:", error);
    }
  });

  return query;
};

export {
  createSegment,
  getSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
}; 