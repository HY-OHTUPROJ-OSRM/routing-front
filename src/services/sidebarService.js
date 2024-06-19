import { UpdateListHighlight } from "../Utils/dispatchUtility";

export const handleViewSidebar = (sidebarOpen, setSideBarOpen) => {
  console.log("berfore", sidebarOpen)  
  UpdateListHighlight()
  if (sidebarOpen===true){
    setSideBarOpen(false)
  } else {
    setSideBarOpen(true)
  }
  console.log("after", sidebarOpen)
  };