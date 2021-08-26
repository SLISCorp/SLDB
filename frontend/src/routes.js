import React from "react";

const Toaster = React.lazy(() =>
  import("./views/notifications/toaster/Toaster")
);
const Charts = React.lazy(() => import("./views/charts/Charts"));
const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));
const Profile = React.lazy(() => import("./views/profile/profile"));
const CoreUIIcons = React.lazy(() =>
  import("./views/icons/coreui-icons/CoreUIIcons")
);
const Flags = React.lazy(() => import("./views/icons/flags/Flags"));
const Brands = React.lazy(() => import("./views/icons/brands/Brands"));
const Alerts = React.lazy(() => import("./views/notifications/alerts/Alerts"));
const Badges = React.lazy(() => import("./views/notifications/badges/Badges"));
const Modals = React.lazy(() => import("./views/notifications/modals/Modals"));
const Colors = React.lazy(() => import("./views/theme/colors/Colors"));
const Typography = React.lazy(() =>
  import("./views/theme/typography/Typography")
);
const Widgets = React.lazy(() => import("./views/widgets/Widgets"));

const Users = React.lazy(() => import("./views/users/Users"));
const User = React.lazy(() => import("./views/users/User"));
const AddUser = React.lazy(() => import("./views/users/AddUser"));
const EditUser = React.lazy(() => import("./views/users/EditUser"));
const UpateProfile = React.lazy(() => import("./views/users/UpateProfile"));

const Groups = React.lazy(() => import("./views/groups/Groups"));
const AddGroup = React.lazy(() => import("./views/groups/AddGroup"));
const EditGroup = React.lazy(() => import("./views/groups/EditGroup"));

const Entities = React.lazy(() => import("./views/entities/Entities"));
const EntityDetail = React.lazy(() => import("./views/entities/EntityDetails"));
const AddEntity = React.lazy(() => import("./views/entities/AddEntity"));
const EditEntity = React.lazy(() => import("./views/entities/EditEntity"));

const UsersReports = React.lazy(() => import("./views/reports/UsersReports"));
const GroupsReports = React.lazy(() => import("./views/reports/GroupsReports"));

const EntitiesAccess = React.lazy(() => import("./views/entitiesAccess/EntitiesAccess"));

const DataExplorer = React.lazy(() => import("./views/dataExplorer/DataExplorer"));

const Events = React.lazy(() => import("./views/events/Events"));
const AddEvent = React.lazy(() => import("./views/events/AddEvent"));
const EditEvent = React.lazy(() => import("./views/events/EditEvent"));

const Nodes = React.lazy(() => import("./views/nodes/Nodes"));
const EditNode = React.lazy(() => import("./views/nodes/EditNode"));
// const AddNode = React.lazy(() => import("./views/nodes/AddNode"));


const Licenses = React.lazy(() => import("./views/licenses/Licenses"));
const AddLicense = React.lazy(() => import("./views/licenses/AddLicense"));
const EditLicense = React.lazy(() => import("./views/licenses/EditLicense"));

const Setting = React.lazy(() => import("./views/pages/setting/setting"));
const UserProfile = React.lazy(() => import("./views/dashboard/profile"));


const routes = [
  { path: "/", exact: true, name: "Dashboard", component: Dashboard },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/profile", name: "Profile", component: Profile },
  {
    path: "/userprofile",
    name: "User Profile",
    component: UserProfile,
    Module: "Dashboard",
  },
  { path: "/user-settings", name: "Setting", component: Setting },
  { path: "/user-settings/:id", name: "Setting", component: Setting },
  {
    path: "/notifications",
    name: "Notifications",
    component: Alerts,
    exact: true,
  },
  { path: "/charts", name: "Charts", component: Charts },
  { path: "/notifications/alerts", name: "Alerts", component: Alerts },
  { path: "/notifications/badges", name: "Badges", component: Badges },
  { path: "/notifications/modals", name: "Modals", component: Modals },
  { path: "/notifications/toaster", name: "Toaster", component: Toaster },
  { path: "/widgets", name: "Widgets", component: Widgets },

  // User Routing start here
  { path: "/users", exact: true, name: "Users", component: Users, isAdmin: true, },
  { path: "/users/add", exact: true, name: "Users", component: AddUser, isAdmin: true },
  { path: "/users/edit/:id", exact: true, name: "Users", component: EditUser, isAdmin: true, },
  { path: "/users/view/:id", exact: true, name: "User Details", component: User, isAdmin: true, },
  {
    path: "/users/saveuser",
    exact: true,
    name: "Update Profile",
    component: UpateProfile,
    isAdmin: true,
  },

  // Group Routing start here
  {
    path: "/groups",
    exact: true,
    name: "Groups",
    component: Groups,
    isAdmin: true,
  },
  {
    path: "/groups/add",
    exact: true,
    name: "Groups",
    component: AddGroup,
    isAdmin: true,
  },
  {
    path: "/groups/edit/:id",
    exact: true,
    name: "Groups",
    component: EditGroup,
    isAdmin: true,
  },

  //Entities Routing start here
  { path: "/entities", exact: true, name: "Entities", component: Entities, isAdmin: true },
  { path: "/entities/add", exact: true, name: "Add Entity", component: AddEntity, isAdmin: true },
  { path: "/entities/edit/:id", exact: true, name: "Edit Entity", component: EditEntity, isAdmin: true },
  { path: "/entities/view/:id", exact: true, name: "Entity Details", component: EntityDetail, isAdmin: true },


  { path: "/user-reports", exact: true, name: "Reports", component: UsersReports, isAdmin: true },
  { path: "/group-reports", exact: true, name: "Reports", component: GroupsReports, isAdmin: true },
  

  //Entities Routing start here
  { path: "/data-explorer", exact: true, name: "Data Explorer", component: DataExplorer, isAdmin: true },

  //Entity Data Access Routing start here
  { path: "/entity-access", exact: true, name: "Entity Data Access", component: EntitiesAccess, isAdmin: true },

  { path: "/events", exact: true, name: "Events", component: Events, isAdmin: true },
  { path: "/events/add", exact: true, name: "Add Events", component: AddEvent, isAdmin: true },
  { path: "/events/edit/:id", exact: true, name: "Edit Events", component: EditEvent, isAdmin: true, },

  { path: "/nodes", exact: true, name: "Nodes", component: Nodes, isAdmin: true },
  { path: "/nodes/edit/:id", exact: true, name: "Edit Node", component: EditNode, isAdmin: true },
  // { path: "/nodes/add", exact: true, name: "Add Node", component: AddNode, isAdmin: true },
  


  { path: "/licenses", exact: true, name: "Licenses", component: Licenses, isAdmin: true },
  { path: "/licenses/add", exact: true, name: "Add License", component: AddLicense, isAdmin: true },
  { path: "/licenses/edit/:id", exact: true, name: "Edit License", component: EditLicense, isAdmin: true, }


];

export default routes;
