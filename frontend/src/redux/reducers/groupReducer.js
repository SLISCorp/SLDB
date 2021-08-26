const intialState = [];
export default (state = intialState, action) => {
  switch (action.type) {
    case "update-group-data":
      return action.payload;
    default:
      return state;
  }
};
