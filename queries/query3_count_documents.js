// =============================================================
// QUERY 3: COUNT DOCUMENTS FOR A SPECIFIC USER
// Requirement: "One should be counting documents for a specific user"
//
// Purpose: Count how many songs user "melodyfan99" has listened to,
// and show a breakdown of listens per month.
// =============================================================

print("\n=== QUERY 3: Listen Count for melodyfan99 ===");

// Total count
var totalListens = db.listenHistory.countDocuments({
  username: "melodyfan99"
});
print("Total listens for melodyfan99: " + totalListens);

// Breakdown by month using aggregation
print("Monthly breakdown:");
db.listenHistory.aggregate([
  { $match: { username: "melodyfan99" } },
  {
    $group: {
      _id: {
        $substr: [
          { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
          0, 7
        ]
      },
      count: { $sum: 1 },
      totalMinutes: {
        $sum: { $divide: ["$playDuration", 60] }
      }
    }
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      _id: 0,
      month: "$_id",
      listens: "$count",
      totalMinutes: { $round: ["$totalMinutes", 1] }
    }
  }
]).forEach(printjson);
