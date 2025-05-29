import Container from "../Container";
import { TbBeach, TbMountain, TbPool } from 'react-icons/tb';
import { GiBarn, GiBoatFishing, GiCactus, GiCastle, GiCaveEntrance, GiForestCamp, GiIsland, GiWindmill, GiTreehouse } from 'react-icons/gi';
import { LuPalmtree, LuBedDouble } from "react-icons/lu";
import { LiaGolfBallSolid, LiaFireAltSolid } from "react-icons/lia";
import { TbCamper } from "react-icons/tb";
import { FaSkiing } from 'react-icons/fa';
import { BsSnow } from 'react-icons/bs';
import { IoDiamond } from 'react-icons/io5';
import { MdOutlineVilla } from 'react-icons/md';
import { useLocation } from "react-router-dom";
import CategoryBox from "../CategoryBox";
export const categoriesArray = [
    {
      label: 'Beach',
      icon: TbBeach,
      description: 'This property is close to the beach!',
    },
    {
      label: 'Windmills',
      icon: GiWindmill,
      description: 'This property is has windmills!',
    },
    {
      label: 'Room',
      icon: LuBedDouble,
      description: 'This property is a room!',
    },
    {
      label: 'Modern',
      icon: MdOutlineVilla,
      description: 'This property is modern!'
    },
    {
      label: 'Countryside',
      icon: TbMountain,
      description: 'This property is in the countryside!'
    },
    {
      label: 'Treehouses',
      icon: GiTreehouse,
      description: 'This property is a tree house!'
    },
    {
      label: 'Pools',
      icon: TbPool,
      description: 'This is property has a beautiful pool!'
    },
    {
      label: 'Islands',
      icon: GiIsland,
      description: 'This property is on an island!'
    },
    {
      label: 'Lake',
      icon: GiBoatFishing,
      description: 'This property is near a lake!'
    },
    {
      label: 'Skiing',
      icon: FaSkiing,
      description: 'This property has skiing activies!'
    },
    {
      label: 'Campers',
      icon: TbCamper,
      description: 'This property is a camper van!'
    },
    {
      label: 'Castles',
      icon: GiCastle,
      description: 'This property is an ancient castle!'
    },
    {
      label: 'Caves',
      icon: GiCaveEntrance,
      description: 'This property is in a spooky cave!'
    },
    {
      label: 'Camping',
      icon: GiForestCamp,
      description: 'This property offers camping activities!'
    },
    {
      label: 'Arctic',
      icon: BsSnow,
      description: 'This property is in arctic environment!'
    },
    {
      label: 'Tropical',
      icon: LuPalmtree,
      description: 'This property is in a tropical environment!'
    },
    {
      label: 'Desert',
      icon: GiCactus,
      description: 'This property is in the desert!'
    },
    {
      label: 'Barns',
      icon: GiBarn,
      description: 'This property is in a barn!'
    },
    {
      label: 'Lux',
      icon: IoDiamond,
      description: 'This property is brand new and luxurious!'
    },
    {
      label: 'Golfing',
      icon: LiaGolfBallSolid,
      description: 'This property is near a golf course!'
    }
  ]

const Categories = () => {

    const params = new URLSearchParams(window.location.search);
    const categoryParams = params?.get('category');  
    const location = useLocation();

    const isMainPage = location.pathname === '/';
    if (!isMainPage) {
        return null;
    }

    return (
       <Container>
            <div className="pt-4 flex flex-row items-center overflow-x-auto justify-between gap-4">
                {categoriesArray.map((category) => (
                    <CategoryBox key={category.label} selected={categoryParams === category.label} icon={category.icon} label={category.label}/>
                ))}
            </div>
       </Container>
    );
}

export default Categories;