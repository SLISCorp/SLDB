db = db.getSiblingDB('modex')
db.createUser(
    {
        user: "adminModex",
        pwd: "modexadmin123",
        roles: [{ role: "dbOwner", db: "modex" }]
    }
);
db.createCollection('users');
db.users.insert(
    {
        "_id": ObjectId("600128bf766a023e239a90c0"),
        "status": "1",
        "email": "admin@sldc.com",
        "role_id": "company",
        "username": "admin",
        "usertype": "2",
        "password": "$2a$10$Ka8lQ70l17mUetPhhe.YyOhtIDPKuGZIcDeddOw0QXWe2GlwwwYqO",
        "created_at": ISODate("2021-01-15T05:31:43.097Z"),
        "updated_at": ISODate("2021-05-03T08:58:12.685Z"),
        "slug": "admin",
        "__enc_private_key": true,
        "__enc_public_key": true,
        "company_id": ObjectId("600128bf766a023e239a90c0"),
        "groups": [],
        "private_key": "4c2757ffe8eeb1b779db25a85d8e0582:b48dbdfdd4a88a8f3a51f00f0819e15569f4177984436c0665adda9004f98ff90854844f46f4d7e104c2624bd5a5cbc6",
        "public_key": "1ef77fdb8adfc597ec865185a6e93005:da1d78fd2193b08c5a2c7500076565f248eddcbd78c96c25a39374c5315100dc6bd779eab4daa0287d00b6d66bdcbf69",
        "user_id": ObjectId("600128bf766a023e239a90c0"),
        "city": "Pembroke Pines",
        "country": "United States",
        "first_name": "Juan ",
        "image": "9ccef0df67234e0d482cd74f5fa42da21613742490548.jpeg",
        "last_name": "Salazar ",
        "phone": "8974512000"
    }
);