import { BiSearch } from "react-icons/bi";
import useAuth from "../../hooks/useAuth";
import useSearchModal from "../../hooks/useSearchModal";
import useLoginModal from "../../hooks/useLoginModal";
const Search = () => {
  const { isAuthenticated } = useAuth();
  const loginModal = useLoginModal();
  const searchModal = useSearchModal();
  return (
    <div
      className="border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-sm transition cursor-pointer"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-semibold px-6" onClick={isAuthenticated ? searchModal.onOpenLocation : loginModal.onOpen}>Anywhere</div>
        <div className="hidden sm:block text-sm font-semibold px-6 border-x-[1px] flex-1 text-center" onClick={isAuthenticated ? searchModal.onOpenDate : loginModal.onOpen}>
          Any Week
        </div>
        <div className="text-sm text-gray-600 pl-6 pr-2 flex flex-row items-center gap-3">
          <div className="hidden sm:block" onClick={isAuthenticated ? searchModal.onOpenCount : loginModal.onOpen}>Add Guests</div>
          <div className="text-white bg-rose-500 rounded-full p-2 hover:text-rose-500 hover:bg-white" onClick={isAuthenticated ? searchModal.onOpen : loginModal.onOpen}>
            <BiSearch size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
