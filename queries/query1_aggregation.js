// =============================================================
// QUERY 1: AGGREGATION FRAMEWORK
// Requirement: "At least one query must use the aggregation framework"
//
// Purpose: Find the top 5 most-played songs across all users,
// showing total plays, total seconds listened, and average
// play duration per song.
// =============================================================

print("=== QUERY 1: Top 5 Most-Played Songs (Aggregation) ===");

db.listenHistory.aggregate([
  // Group by song, compute stats
  {
    $group: {
      _id: "$song.songID",
      title: { $first: "$song.title" },
      artistName: { $first: "$song.artistName" },
      albumTitle: { $first: "$song.albumTitle" },
      totalPlays: { $sum: 1 },
      totalSecondsPlayed: { $sum: "$playDuration" },
      avgPlayDuration: { $avg: "$playDuration" }
    }
  },
  // Sort by most plays, then most time listened
  { $sort: { totalPlays: -1, totalSecondsPlayed: -1 } },
  // Limit to top 5
  { $limit: 5 },
  // Clean up output
  {
    $project: {
      _id: 0,
      songID: "$_id",
      title: 1,
      artistName: 1,
      albumTitle: 1,
      totalPlays: 1,
      totalSecondsPlayed: 1,
      avgPlayDuration: { $round: ["$avgPlayDuration", 1] }
    }
  }
]).forEach(printjson);
