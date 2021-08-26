module.exports = {
  site_url: process.env.SITE_URL,
  admin_mail: process.env.ADMIN_MAIL,
  site_name: process.env.SITE_NAME,

  senderHost: "smtp.gmail.com",
  senderPort: 587,
  email_from: "vishalmusic07@gmail.com",
  email_auth_password: "ttcpekqgyjpfcdeq",
  fcmServerKey: "AAAAlhzgSJQ:APA91bECWMrpwXnvZhrRj0yxXtZgjCGYr-BV6Nrx9wgBKFMtPB5CI_1baFU7OcWwfkHaHMGefN-Mx05ZIucB4ZtP7H0pfrO2dcxK2iiALYSM7en3V-da_hCz0WSPArByhSGxwC_kXnEK",
  secret_key: process.env.SECRETE_KEY || "SLDBBLOCKCHAIN@098123",

  signOptions: {
    issuer: "SolucionesLatam",
    subject: "SolucionesLatam",
    audience: "SolucionesLatam.com",
    expiresIn: "84h",
    algorithm: "RS256",
  },
  nodeConfig: {
    first_node_ip: "18.228.58.25",
    second_node_ip: "54.233.173.220",
    third_node_ip: "15.228.21.132",
    fourth_node_ip: "54.232.10.154",
    port: process.env.BIGCHAIN_PORT,
  },

  entityDataType: ["String", "Array", "Object", "Number", "Boolean"],
  systemSchema: ["_Group", "_User", "_Schema", "_Event", "_Permission", "_Licenses", "_Nodes"]
};
