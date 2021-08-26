import Session from "../../helpers/session";
var intialState = Session.getSession("ModexWeb");
export default (state = intialState, action) => {
  switch (action.type) {
    case "login_user":
      Session.setSession("ModexWeb", { ...state, ...action.payload });
      return action.payload;
    case "update_profile":
      Session.setSession("ModexWeb", { ...state, ...action.payload });
      return { ...state, ...action.payload };
    case "logout":
      Session.clearItem("ModexWeb");
      state = {};
      return action.payload;
    default:
      return state;
  }
};
