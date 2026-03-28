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
