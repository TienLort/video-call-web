import React from "react";
import MainLayout from "src/layout/main_layout";
// import News from 'src/pages/news';
// import NewsDetail from 'src/pages/news/new_detail';
import { IRoute } from "src/types/route";
import { CPath } from "./path";
import DeepFakeImage from "src/pages/DeepFakeImage";
import DeepFakeVideo from "src/pages/DeepFakeVideo";
import ManagerFolder from "src/pages/ManagerFolder";
import HistoryCallFolder from "src/pages/HistoryCallFolder";

const Login = React.lazy(() => import("src/pages/Login"));
const Home = React.lazy(() => import("src/pages/Home"));
// const Room = React.lazy(() => import("src/pages/Room"));

export const CRouteList: IRoute[] = [
  {
    path: CPath.login,
    name: "Login",
    component: Login,
  },
  {
    path: CPath.home,
    name: "Home",
    component: Home,
    layout: MainLayout,
  },
  {
    path: CPath.deepfakeimg,
    name: "DeepFake",
    component: DeepFakeImage,
    layout: MainLayout,
  },
  {
    path: CPath.deepfakevideo,
    name: "DeepFake",
    component: DeepFakeVideo,
    layout: MainLayout,
  },
  {
    path: CPath.deepfakemanager,
    name: "DeepFake",
    component: ManagerFolder,
    layout: MainLayout,
  },
  {
    path: CPath.history,
    name: "History",
    component: HistoryCallFolder,
    layout: MainLayout,
  },
  // {
  //   path: CPath.room,
  //   name: "room",
  //   component: Room,
  //   layout: DefaultLayout,
  // },
];
