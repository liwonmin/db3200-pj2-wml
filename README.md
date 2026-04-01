# StreamIQ - MongoDB Database Project
This project designs and implements a database for a music streaming platform called StreamIQ. Originally built as a normalized relational database in SQLite3 (Project 1), the system has been adapted to a document-based MongoDB database (Project 2). The platform models core entities such as users, artists, albums, songs, playlists, listen history, and streaming analytics.

For the MongoDB adaptation, the 10 normalized relational tables were restructured into 3 root collections — users, artists, and listenHistory — using embedded documents and denormalization following MongoDB best practices. Playlists, followed artists, and listening snapshots are embedded within user documents. Albums and songs (with credited artist roles) are embedded within artist documents. Listen history remains a separate collection to handle unbounded growth, with denormalized song snapshots for fast reads. The project includes a hierarchical ERD, example JSON collection definitions, mock data with import instructions, and five MongoDB queries covering the aggregation framework, complex search criteria with logical connectors, document counting, and update operations.

ai-usage: AI tools (Claude) were used to assist with generating mock data, structuring JSON collection examples, and drafting MongoDB queries.

uml diagram url:[ https://lucid.app/lucidchart/c9bd40e4-83f2-448a-9769-c81f1e9cafdc/edit?invitationId=inv_4d8b1b3d-a69b-47f9-8abd-9f3148d1c77b&page=0_0#](https://lucid.app/lucidchart/c9bd40e4-83f2-448a-9769-c81f1e9cafdc/edit?viewport_loc=409%2C1180%2C3016%2C1800%2C0_0&invitationId=inv_4d8b1b3d-a69b-47f9-8abd-9f3148d1c77b)

erd url: https://lucid.app/lucidchart/bcc77c0b-a90d-45d7-b746-c14ecd1f02a4/edit?viewport_loc=-280%2C177%2C3291%2C1965%2C0_0&invitationId=inv_ef9d8c28-5e08-403c-91f9-f3bee7038371

video link: https://youtu.be/wofbLdMKAB0
