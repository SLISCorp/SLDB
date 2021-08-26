let apiUrl = {
  // Common

  // admin
  adminLogin: "admin/users/login",
  adminLogout: "admin/users/user_logout",
  adminForgotPassword: "admin/users/forgot-password",
  adminResetPassword: "admin/users/reset-password",
  adminChangePassword: "admin/users/changepassword",
  adminGetProfile: "admin/users/profile",
  adminUpdateProfile: "admin/users/profile",

  /*User routing start here*/
  getUsers: "admin/users",
  addUser: "admin/users/add",
  editUser: "admin/users/edit",
  deleteUser: "admin/users/delete",
  viewUser: "admin/users/view",
  upateProfile: "admin/users/updateProfile",

  // Groups routing
  getGroups: "admin/groups",
  addGroup: "admin/groups/add",
  viewGroup: "admin/groups/",
  editGroup: "admin/groups/",
  deleteGroup: "admin/groups/",

  // Entity routing
  getDataTypes: "admin/data-types",
  getEntity: "admin/entity",
  getEntityDetails: "admin/entity/view",
  addEntity: "admin/entity",
  editEntity: "admin/entity",

  // entity data explore section
  addEntityData: "admin/data-explore",
  listDataByEntity: "admin/data-explore/list",
  TransferData: "admin/data-explore",
  DeleteData: "admin/data-explore",

  // Permission routing
  entitiesList: "admin/permission/enties_list",
  getGroupsList: "admin/permission/group_list",
  addPermission: "admin/permission",
  editPermission: "admin/permission",
  deletePermission: "admin/permission",
  getPermissionData: "admin/permission",

  // Event Routing
  ownerList: "admin/events/owners-list/",
  getEvents: "admin/events/",
  addEvent: "admin/events/",
  EditEvent: "admin/events/",
  DeleteEvent: "admin/events/",
  viewEvent: "admin/events/view",


  // Reports Routing
  getUserReports: "admin/user-reports/",
  getGroupReports: "admin/group-reports/",



  // node setting
  getLicense: "admin/license/",
  addLicense: "admin/license/",
  editLicense: "admin/license/",
  viewLicense: "admin/license/view",
  deletelicence: "admin/license/",

  // node routing
  getNodes: "admin/nodes",
  viewNode: "admin/nodes/view",
  editNode: "admin/nodes/",
  //Notifications Routing 

  notificationList: "admin/users/get_notifications_list"

};

export default apiUrl;
