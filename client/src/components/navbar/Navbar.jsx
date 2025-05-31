import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Container from "../Container";
import Categories from "./Categories";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const location = useLocation();
  const [isShow, setIsShow] = useState(true);
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/listing") {
      setIsShow(false);
    } else {
      setIsShow(true);
    }
  }, [location, isShow]);
  return (
    <div className="fixed w-full bg-white z-10 shadow-sm">
      <div className=" py-4 border-b-[1px]">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            <Logo />
            {isShow && <Search />}
            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          </div>
        </Container>
      </div>
      <Categories />
    </div>
  );
};

export default Navbar;
