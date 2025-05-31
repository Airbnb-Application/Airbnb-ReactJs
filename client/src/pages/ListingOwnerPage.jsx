import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import getAllPlaces from "../action/getAllPlaces";
import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import ListingCard from "../components/listing/ListingCard";
import useSearchUrl from "../hooks/useSearchUrl.js";

const ListingOwnerPage = () => {
  const [data, setData] = useState([]);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const { searchUrl } = useSearchUrl();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllPlaces(query);
        setData(response);
        console.log(response);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
      }
    };
    fetchData();
  }, [searchUrl, data.toString()]);

  return (
    <>
      {(data.length === 0 && <EmptyState showReset />) || (
        <div className="pb-20 pt-40">
          <Container>
            <div
              className="
                pt-24
                grid
                grid-cols-1
                sm:grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                2xl:grid-cols-4
                gap-10
              "
            >
              {data.map((item) => (
                <ListingCard data={item} key={item._id} />
              ))}
            </div>
          </Container>
        </div>
      )}
    </>
  );
};

export default ListingOwnerPage;
