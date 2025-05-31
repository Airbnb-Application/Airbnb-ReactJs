import storeToken from "../../hooks/storeToken.js";
import useCountries from "../../hooks/useCountries";
import HeartButton from "../button/HeartButton.jsx";

const ListingHead = (props) => {
  const { title, locationValue, imageSrc, id, status, creator } = props;
  const { getByValue } = useCountries();
  const location = getByValue(locationValue);
  const { role } = storeToken();
  const authEmail = localStorage.getItem("authEmail");

  const isOwnerOrAdmin = creator?.email === authEmail || role === "admin";

  const getStatusBadge = () => {
    if (!isOwnerOrAdmin || !status) return null;

    const badgeStyle =
      status === "active"
        ? "bg-green-100 text-green-800 border border-green-200"
        : "bg-red-100 text-red-800 border border-red-200";

    return (
      <span
        className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${badgeStyle}`}
      >
        {status === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-row justify-between pb-[10px]">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center">
            <div className="text-2xl font-bold">{title}</div>
            {getStatusBadge()}
          </div>
          <div className="font-light text-md text-neutral-500">{`${location.region}, ${location.label}`}</div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-full h-[70vh] relative overflow-hidden">
          <img
            src={imageSrc}
            alt="listingImg"
            className="object-cover h-full rounded-xl"
          ></img>
          <div className="absolute top-5 right-5">
            <HeartButton listingId={id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingHead;
