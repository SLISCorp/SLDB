import React, { Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, useRouteMatch, Switch } from "react-router-dom";
import { CContainer, CFade } from "@coreui/react";

// routes config
import routes from "../routes";

const Page404 = React.lazy(() => import("../views/pages/page404/Page404"));

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

const TheContent = (props) => {
  let { path } = useRouteMatch();
  const user = useSelector((state) => state.user);
  path = path.includes("*") ? path.substr(0, path.indexOf("*") - 1) : path;
  return (
    <main className="c-main">
      <CContainer fluid>
        <Suspense fallback={loading}>
          <Switch>
            {routes.map((route, idx) => {
              if (
                route.isAdmin &&
                (user.role_id == "admin" || user.role_id == "company")
              ) {
                return (
                  route.component && (
                    <Route
                      key={idx}
                      path={`${path}${route.path}`}
                      exact={route.exact}
                      name={route.name}
                      render={(props) => (
                        <CFade>
                          <route.component {...props} />
                        </CFade>
                      )}
                    />
                  )
                );
              } else if (!route.isAdmin) {
                return (
                  route.component && (
                    <Route
                      key={idx}
                      path={`${path}${route.path}`}
                      exact={route.exact}
                      name={route.name}
                      render={(props) => (
                        <CFade>
                          <route.component {...props} />
                        </CFade>
                      )}
                    />
                  )
                );
              } else {
                <Route
                  path="/*"
                  exact
                  render={(props) => <Page404 {...props} />}
                />;
              }
            })}
            <Redirect from="/" to="/dashboard" />
          </Switch>
        </Suspense>
      </CContainer>
    </main>
  );
};

export default React.memo(TheContent);
