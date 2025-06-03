import { Campaign } from "../models/campaign.model.js";
import { Segment } from "../models/segment.model.js";
import { CommunicationLog } from "../models/comunicationLog.model.js";
import { Customer } from "../models/customer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Helper to build MongoDB query from rules
const buildSegmentQuery = (rules) => {
  // Handle both direct rules object and segment document format
  const segmentRules = rules.rules ? rules : rules.rules;

  const query = {};
  const getFieldPath = (field) => {
    const fieldMap = {
      total_spent: "stats.total_spent",
      order_count: "stats.order_count",
      last_purchase: "stats.last_purchase",
      city: "address.city",
      is_active: "is_active",
    };
    return fieldMap[field] || field;
  };

  const conditions = segmentRules.rules.map((rule) => {
    const fieldPath = getFieldPath(rule.field);
    let value = rule.value;

    // Special handling for last_purchase (convert days to date)
    if (rule.field === "last_purchase") {
      const daysAgo = parseInt(value);
      if (!isNaN(daysAgo)) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        value = date;
      }
    }

    // Special handling for boolean fields
    if (rule.field === "is_active") {
      value = value === "true" || value === true;
    }

    switch (rule.operator) {
      case ">":
        return { [fieldPath]: { $gt: value } };
      case "<":
        return { [fieldPath]: { $lt: value } };
      case ">=":
        return { [fieldPath]: { $gte: value } };
      case "<=":
        return { [fieldPath]: { $lte: value } };
      case "==":
        return { [fieldPath]: { $eq: value } };
      case "!=":
        return { [fieldPath]: { $ne: value } };
      case "contains":
        return { [fieldPath]: { $regex: value, $options: "i" } };
      default:
        return {};
    }
  });

  if (segmentRules.combinator === "and" || segmentRules.condition === "AND") {
    query.$and = conditions;
  } else {
    query.$or = conditions;
  }

  return query;
};

// Create segment
const createSegment = asyncHandler(async (req, res) => {
  const { name, description, rules } = req.body;

  // 1. Validate input
  if (!name || !rules?.rules || rules.rules.length === 0) {
    throw new ApiError(400, "Name and at least one rule are required");
  }

  // 2. Build query and estimate count
  const query = buildSegmentQuery(rules);
  const estimatedCount = await Customer.countDocuments(query);

  // 3. Create segment linked to authenticated user
  const segment = await Segment.create({
    name,
    description,
    rules,
    estimated_count: estimatedCount,
    created_by: req.user._id,
    is_dynamic: true,
  });

  res
    .status(201)
    .json(new ApiResponse(201, segment, "Segment created successfully"));
});

// Get segments for current user
const getUserSegments = asyncHandler(async (req, res) => {
  const segments = await Segment.find({ created_by: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  // Transform the rules for better frontend display
  const transformedSegments = segments.map(segment => ({
    ...segment,
    rules: {
      condition: segment.rules.condition,
      rules: segment.rules.rules.map((rule) => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        value_type: rule.value_type,
      })),
    },
  }));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transformedSegments,
        "Segments fetched successfully"
      )
    );
});

// Estimate segment size
const estimateSegment = asyncHandler(async (req, res) => {
  const { rules } = req.body;

  if (!rules?.rules || rules.rules.length === 0) {
    throw new ApiError(400, "At least one rule is required");
  }

  const query = buildSegmentQuery(rules);

  const count = await Customer.countDocuments(query);

  res
    .status(200)
    .json(new ApiResponse(200, { count }, "Segment estimated successfully"));
});

// Create campaign
const createCampaign = asyncHandler(async (req, res) => {
  const { name, segmentId, template } = req.body;

  // 1. Validate input
  if (!name || !segmentId || !template?.subject || !template?.body) {
    throw new ApiError(400, "Name, segment ID, and template are required");
  }

  // 2. Verify segment belongs to user and has rules
  const segment = await Segment.findOne({
    _id: segmentId,
    created_by: req.user._id,
  });

  if (!segment) {
    throw new ApiError(404, "Segment not found or access denied");
  }

  if (!segment.rules || segment.rules.rules.length === 0) {
    throw new ApiError(400, "Segment has no rules defined");
  }

  // 3. Verify the segment actually matches customers
  const query = buildSegmentQuery(segment.rules);
  const customerCount = await Customer.countDocuments(query);

  if (customerCount === 0) {
    throw new ApiError(
      400,
      "Segment matches 0 customers - cannot create campaign"
    );
  }

  // 4. Create campaign with accurate initial count
  const campaign = await Campaign.create({
    name,
    segment_id: segmentId,
    template,
    created_by: req.user._id,
    status: "draft",
    stats: {
      total_recipients: customerCount, // Use actual count from query
    },
  });

  // 5. Process campaign in background
  processCampaignInBackground(campaign._id);

  res
    .status(201)
    .json(new ApiResponse(201, campaign, "Campaign created successfully"));
});

// Get user's campaigns
const getUserCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ created_by: req.user._id })
    .populate("segment_id", "name estimated_count")
    .sort("-created_at");

  res
    .status(200)
    .json(new ApiResponse(200, campaigns, "Campaigns fetched successfully"));
});

// Delivery Receipt API
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { message_id, status, timestamp } = req.body;

  if (!message_id || !status) {
    throw new ApiError(400, "Message ID and status are required");
  }

  const log = await CommunicationLog.findOne({ message_id });
  if (!log) {
    throw new ApiError(404, "Communication log not found");
  }

  // Update status and relevant timestamp
  const update = { status };
  switch (status) {
    case "delivered":
      update.delivered_at = timestamp || new Date();
      break;
    case "opened":
      update.opened_at = timestamp || new Date();
      break;
    case "clicked":
      update.clicked_at = timestamp || new Date();
      break;
  }

  await CommunicationLog.findByIdAndUpdate(log._id, update);

  res.status(200).json(new ApiResponse(200, null, "Delivery status updated successfully"));
});

// Background processing
const processCampaignInBackground = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId)
      .populate("segment_id")
      .populate("created_by");

    if (!campaign) return;

    // 1. Get customers matching segment using the same query logic as preview
    const query = buildSegmentQuery(campaign.segment_id.rules);
    const customers = await Customer.find(query).lean();

    // 2. Update campaign status with exact count
    campaign.status = "processing";
    campaign.stats.total_recipients = customers.length;
    await campaign.save();

    // 3. Process communications only for segmented customers
    let sent = 0;
    let failed = 0;
    let delivered = 0;
    let opened = 0;
    let clicked = 0;

    // Batch processing for better performance
    const batchSize = 100;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      const logPromises = batch.map((customer) => {
        const isSuccess = Math.random() < 0.9;
        const message_id = `msg_${Date.now()}_${customer._id}`;
        
        return CommunicationLog.create({
          campaign_id: campaign._id,
          customer_id: customer._id,
          status: isSuccess ? "queued" : "failed",
          message_id,
          sent_at: new Date(),
          ...(!isSuccess && { failure_reason: "Simulated failure" }),
        });
      });

      const results = await Promise.allSettled(logPromises);

      // Process successful sends
      for (const result of results) {
        if (result.status === "fulfilled") {
          const log = result.value;
          if (log.status === "queued") {
            sent++;
            
            // Simulate delivery after a random delay (0-5 seconds)
            setTimeout(async () => {
              if (Math.random() < 0.95) { // 95% delivery rate
                await CommunicationLog.findByIdAndUpdate(log._id, {
                  status: "delivered",
                  delivered_at: new Date()
                });
                delivered++;

                // Simulate open after a random delay (0-10 seconds)
                setTimeout(async () => {
                  if (Math.random() < 0.7) { // 70% open rate
                    await CommunicationLog.findByIdAndUpdate(log._id, {
                      status: "opened",
                      opened_at: new Date()
                    });
                    opened++;

                    // Simulate click after a random delay (0-15 seconds)
                    setTimeout(async () => {
                      if (Math.random() < 0.3) { // 30% click rate
                        await CommunicationLog.findByIdAndUpdate(log._id, {
                          status: "clicked",
                          clicked_at: new Date()
                        });
                        clicked++;
                      }
                    }, Math.random() * 15000);
                  }
                }, Math.random() * 10000);
              }
            }, Math.random() * 5000);
          } else {
            failed++;
          }
        } else {
          failed++;
          console.error("Failed to create log:", result.reason);
        }
      }
    }

    // 4. Finalize campaign with accurate stats
    campaign.status = "completed";
    campaign.stats.sent = sent;
    campaign.stats.failed = failed;
    campaign.stats.delivered = delivered;
    campaign.stats.opened = opened;
    campaign.stats.clicked = clicked;
    campaign.stats.delivery_rate = customers.length > 0 ? (sent / customers.length) * 100 : 0;
    campaign.stats.open_rate = sent > 0 ? (opened / sent) * 100 : 0;
    campaign.stats.click_rate = opened > 0 ? (clicked / opened) * 100 : 0;
    await campaign.save();
  } catch (error) {
    console.error("Campaign processing failed:", error);
    await Campaign.findByIdAndUpdate(campaignId, {
      status: "failed",
      "stats.failure_reason": error.message,
    });
  }
};

const getCommuniactionLog = asyncHandler(async (req, res) => {
  const { campaignId } = req.query;

  if (!campaignId) {
    throw new ApiError(400, "Campaign ID is required");
  }

  const logs = await CommunicationLog.find({ campaign_id: campaignId })
    .populate({
      path: "customer_id",
      select: "name email phone address",
      model: Customer,
    })
    .sort({ sent_at: -1 });

  // Transform the data to flatten customer info
  const transformedLogs = logs.map((log) => {
    const logObj = log.toObject();
    return {
      ...logObj,
      customer: logObj.customer_id,
      customer_id: undefined, // Remove the nested customer_id
    };
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transformedLogs,
        "Communication logs fetched successfully"
      )
    );
});

// Get detailed segment preview
const getSegmentPreview = asyncHandler(async (req, res) => {
  const { rules } = req.body;

  if (!rules?.rules || rules.rules.length === 0) {
    throw new ApiError(400, "At least one rule is required");
  }

  const query = buildSegmentQuery(rules);

  // Get total count
  const totalCount = await Customer.countDocuments(query);

  // Get sample customers (up to 5)
  const sampleCustomers = await Customer.find(query)
    .select('name email stats demographics address')
    .limit(5)
    .lean();

  // Get gender distribution
  const genderDistribution = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$demographics.gender",
        count: { $sum: 1 }
      }
    }
  ]);

  // Get age group distribution
  const ageGroups = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ["$demographics.age", 18] }, then: "Under 18" },
              { case: { $lt: ["$demographics.age", 25] }, then: "18-24" },
              { case: { $lt: ["$demographics.age", 35] }, then: "25-34" },
              { case: { $lt: ["$demographics.age", 45] }, then: "35-44" },
              { case: { $lt: ["$demographics.age", 55] }, then: "45-54" },
              { case: { $lt: ["$demographics.age", 65] }, then: "55-64" }
            ],
            default: "65+"
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get occupation distribution
  const occupationDistribution = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$demographics.occupation",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Get city distribution
  const cityDistribution = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$address.city",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Get spending statistics
  const spendingStats = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        avgSpent: { $avg: "$stats.total_spent" },
        maxSpent: { $max: "$stats.total_spent" },
        minSpent: { $min: "$stats.total_spent" },
        totalSpent: { $sum: "$stats.total_spent" }
      }
    }
  ]);

  // Get activity statistics
  const activityStats = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        avgOrders: { $avg: "$stats.order_count" },
        activeCustomers: {
          $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] }
        }
      }
    }
  ]);

  // Get purchase frequency distribution
  const purchaseFrequency = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $eq: ["$stats.order_count", 0] }, then: "No Orders" },
              { case: { $lte: ["$stats.order_count", 1] }, then: "1 Order" },
              { case: { $lte: ["$stats.order_count", 3] }, then: "2-3 Orders" },
              { case: { $lte: ["$stats.order_count", 5] }, then: "4-5 Orders" }
            ],
            default: "5+ Orders"
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalCount,
      sampleCustomers,
      demographics: {
        gender: genderDistribution.map(d => ({ gender: d._id || 'Unknown', count: d.count })),
        ageGroups: ageGroups.map(a => ({ ageGroup: a._id, count: a.count })),
        occupation: occupationDistribution.map(o => ({ occupation: o._id || 'Unknown', count: o.count }))
      },
      cityDistribution: cityDistribution.map(c => ({ city: c._id || 'Unknown', count: c.count })),
      spendingStats: spendingStats[0] || {
        avgSpent: 0,
        maxSpent: 0,
        minSpent: 0,
        totalSpent: 0
      },
      activityStats: activityStats[0] || {
        avgOrders: 0,
        activeCustomers: 0
      },
      purchaseFrequency: purchaseFrequency.map(p => ({ frequency: p._id, count: p.count }))
    }, "Segment preview generated successfully")
  );
});

export {
  createCampaign,
  getUserCampaigns,
  createSegment,
  getUserSegments,
  estimateSegment,
  getCommuniactionLog,
  getSegmentPreview,
  updateDeliveryStatus
};
