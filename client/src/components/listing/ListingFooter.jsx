import { FaRegCopyright } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";

const ListingFooter = (props) => {
  const { isUser } = props;
  return (
    <>
      {isUser !== null && (
        <div className="max-w-screen-lg mx-auto pb-[40px] pt-[20px] max-lg:px-[20px]">
          <div className="border-t-2 pt-[20px]"></div>
          <div className="font-semibold text-xl pb-[20px] max-md:hidden">
            Things to know
          </div>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:px-[20px]">
            <div className="flex flex-col gap-3 max-md:border-b-2 max-md:pb-[15px]">
              <div className="font-semibold text-sm max-md:text-2xl">
                House rules
              </div>
              <div className="font-light text-sm flex flex-col gap-2">
                <div>Check-in: 1:00 PM - 2:00 PM</div>
                <div>Checkout before 11:00 AM</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-md:border-b-2 max-md:pb-[15px]">
              <div className="font-semibold text-sm max-md:text-2xl">
                Safety & property
              </div>
              <div className="font-light text-sm flex flex-col gap-2">
                <div>No carbon monoxide alarm</div>
                <div>Security camera/recording device</div>
                <div>Smoke alarm</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="font-semibold text-sm max-md:text-2xl">
                Cancellation policy
              </div>
              <div className="font-light text-sm flex flex-col gap-2">
                <div>This reservation is non-refundable.</div>
                <div>
                  Review the Host’s full cancellation policy which applies even
                  if you cancel for illness or disruptions caused by COVID-19.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-[40px] pb-[40px] bg-[#f7f7f7] border-t-2 max-lg:px-[20px]">
        <div className={`${isUser !== null ? "max-w-screen-lg" : "max-w-[1380px]"} mx-auto`} >
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:px-[20px]">
            <div className="flex flex-col gap-3 max-md:border-b-2 max-md:pb-[15px]">
              <div className="font-semibold text-sm">Support</div>
              <div className="font-light text-sm flex flex-col gap-2">
                <div>Support Center</div>
                <div>Ask for help with safety</div>
                <div>Anti-discrimination</div>
                <div>Support people with disabilities</div>
                <div>Cancellation options</div>
                <div>Report neighborhood concern</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-md:border-b-2 max-md:pb-[15px]">
              <div className="font-semibold text-sm">Hosting</div>
              <div className="font-light text-sm flex flex-col gap-2">
                <div>Make your home</div>
                <div>Hosting resources</div>
                <div>Community forum</div>
                <div>Hosting responsibly</div>
                <div>Friendly apartments</div>
                <div>Join a free Hosting class</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="font-semibold text-sm">Booking App</div>
              <div className="font-light text-sm flex flex-col gap-2">
                <div>About us</div>
                <div>Newsroom</div>
                <div>New features</div>
                <div>Careers</div>
                <div>Gift cards</div>
                <div>Investors</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isUser ? "max-w-screen-lg" : "max-w-[1380px]"} mx-auto pt-[40px]`}>
          <div className="border-t-2"></div>
          <div className="pt-[20px] items-center flex flex-row justify-between max-md:flex-col max-md:gap-2">
            <div className="flex flex-row gap-2">
              <FaRegCopyright />
              <div className="text-sm">2024 Group 6, Inc - Term - Privacy</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="text-sm">$ USD</div>
              <FaFacebookSquare size={20} />
              <FaInstagram size={20} />
              <FaTwitter size={20} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingFooter;
