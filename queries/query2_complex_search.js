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
