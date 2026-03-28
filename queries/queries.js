// =============================================================
// StreamIQ MongoDB Queries
// Database: streamiq
// Collections: users, artists, listenHistory
//
// Run these in mongosh:
//   mongosh streamiq
//   load("queries.js")
//
// Or paste them individually into mongosh or MongoDB Compass
// =============================================================


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


// =============================================================
// QUERY 2: COMPLEX SEARCH CRITERION
// Requirement: "One must contain a complex search criterion
// (more than one expression with logical connectors like $or)"
//
// Purpose: Find songs that are either explicit OR longer than
// 250 seconds, from albums released after 2023, in the
// Electronic or Hip-Hop genre.
// =============================================================

print("\n=== QUERY 2: Explicit or Long Songs in Electronic/Hip-Hop (Complex Search) ===");

db.artists.aggregate([
  // Only Electronic or Hip-Hop artists
  {
    $match: {
      primaryGenre: { $in: ["Electronic", "Hip-Hop"] }
    }
  },
  // Unwind albums then songs
  { $unwind: "$albums" },
  { $unwind: "$albums.songs" },
  // Filter: released after 2023 AND (explicit OR duration > 250)
  {
    $match: {
      "albums.releaseDate": { $gte: "2023-01-01" },
      $or: [
        { "albums.songs.isExplicit": true },
        { "albums.songs.duration": { $gt: 250 } }
      ]
    }
  },
  // Project clean output
  {
    $project: {
      _id: 0,
      artistName: "$name",
      genre: "$primaryGenre",
      albumTitle: "$albums.title",
      releaseDate: "$albums.releaseDate",
      songTitle: "$albums.songs.title",
      duration: "$albums.songs.duration",
      isExplicit: "$albums.songs.isExplicit"
    }
  }
]).forEach(printjson);


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


// =============================================================
// QUERY 4: UPDATE DOCUMENT BASED ON QUERY PARAMETER
// Requirement: "One must be updating a document based on a query
// parameter (e.g. flipping on or off a boolean attribute)"
//
// Purpose: Toggle the isExplicit flag for all songs by "Max Sterling"
// in the album "Concrete Jungle" — flipping true to false and
// false to true. This simulates an admin enabling/disabling the
// explicit content flag.
// =============================================================

print("\n=== QUERY 4: Toggle isExplicit for Max Sterling's 'Concrete Jungle' songs ===");

// Show BEFORE state
print("BEFORE update:");
db.artists.findOne(
  { name: "Max Sterling" },
  { "albums": { $elemMatch: { title: "Concrete Jungle" } } }
).albums[0].songs.forEach(function(s) {
  print("  " + s.title + " — isExplicit: " + s.isExplicit);
});

// Toggle isExplicit: find songs where isExplicit is true and set to false
db.artists.updateOne(
  { name: "Max Sterling", "albums.title": "Concrete Jungle" },
  [
    {
      $set: {
        "albums": {
          $map: {
            input: "$albums",
            as: "album",
            in: {
              $cond: {
                if: { $eq: ["$$album.title", "Concrete Jungle"] },
                then: {
                  $mergeObjects: [
                    "$$album",
                    {
                      songs: {
                        $map: {
                          input: "$$album.songs",
                          as: "song",
                          in: {
                            $mergeObjects: [
                              "$$song",
                              { isExplicit: { $not: "$$song.isExplicit" } }
                            ]
                          }
                        }
                      }
                    }
                  ]
                },
                else: "$$album"
              }
            }
          }
        }
      }
    }
  ]
);

// Show AFTER state
print("AFTER update:");
db.artists.findOne(
  { name: "Max Sterling" },
  { "albums": { $elemMatch: { title: "Concrete Jungle" } } }
).albums[0].songs.forEach(function(s) {
  print("  " + s.title + " — isExplicit: " + s.isExplicit);
});


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
