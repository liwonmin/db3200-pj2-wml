// =============================================================
// QUERY 5: FIND + JOIN-LIKE QUERY
// Requirement: Additional query to showcase the database
//
// Purpose: For each user, show their subscription tier,
// number of playlists, number of followed artists, and
// total listening time from their snapshots.
// =============================================================

print("\n=== QUERY 5: User Dashboard Summary ===");

db.users.aggregate([
  {
    $project: {
      _id: 0,
      username: 1,
      subscriptionTier: 1,
      numPlaylists: { $size: "$playlists" },
      numFollowedArtists: { $size: "$followedArtists" },
      totalListeningMinutes: {
        $sum: "$listeningSnapshots.totalMinutes"
      }
    }
  },
  { $sort: { totalListeningMinutes: -1 } }
]).forEach(printjson);
