import { useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";
import useSearchUrl from "../../hooks/useSearchUrl.js";

const Logo = () => {
  const navigate = useNavigate();
  const { setSearchUrl } = useSearchUrl();

  return (
    <img
      onClick={() => {
        setSearchUrl("");
        navigate(ROUTES.HOME);
      }}
      alt="Logo"
      height={60}
      width={60}
      src="/icon.png"
      className="
            hidden 
            md:block 
            cursor-pointer
            w-[60px] h-[60px]"
    ></img>
  );
};

export default Logo;
